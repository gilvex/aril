import { useCallback, useEffect, useRef, useState } from 'react'
import {
  request,
  workspaceHeaders,
  ApiError,
  type Workspace,
  type Envelope,
} from '../../../shared/api/workspace'
import {
  applyOperations,
  diffWorkspace,
  MergeConflict,
  type Operation,
} from '../../../../domain/collaboration'
import {
  writeVersion,
  canRebaseOperations,
  type RecoveryDraft,
} from '../../../../domain/freshness'

export const draftKey = 'pomegranate-studio-draft-v2'
export const scopedDraftKey = (workspaceId: string, profileId: string) =>
  `${draftKey}:${profileId}:${workspaceId}`
export type Recovery = RecoveryDraft
type HistoryItem = Operation[][]
const viewsKey = 'pomegranate-studio-views'
function keepViews(next: Workspace, local: Workspace): Workspace {
  return {
    ...next,
    boards: next.boards.map((board) => ({
      ...board,
      viewport: local.boards.find((b) => b.id === board.id)?.viewport,
      wireframeViewport: local.boards.find((b) => b.id === board.id)
        ?.wireframeViewport,
    })),
  }
}
function loadViews(workspace: Workspace, viewsKey: string): Workspace {
  try {
    const views = JSON.parse(sessionStorage.getItem(viewsKey) || '{}')
    return {
      ...workspace,
      boards: workspace.boards.map((board) => {
        const valid = (view: Workspace['boards'][number]['viewport']) =>
          view &&
          Number.isFinite(view.x) &&
          Number.isFinite(view.y) &&
          view.zoom >= 0.1 &&
          view.zoom <= 3
        return {
          ...board,
          ...(valid(views[board.id]) ? { viewport: views[board.id] } : {}),
          ...(valid(views[board.id + ':wireframes'])
            ? { wireframeViewport: views[board.id + ':wireframes'] }
            : {}),
        }
      }),
    }
  } catch {
    return workspace
  }
}
export function useWorkspace(
  initial: Envelope,
  workspaceId: string,
  profileId: string,
  recovery?: Recovery,
) {
  const storageKey = scopedDraftKey(workspaceId, profileId)
  const cameraKey = `${viewsKey}:${profileId}:${workspaceId}`
  const [workspace, setWorkspace] = useState(() =>
    loadViews(recovery?.workspace || initial.workspace, cameraKey),
  )
  const [saveState, setSaveState] = useState<
    'saved' | 'pending' | 'saving' | 'error'
  >(recovery ? 'pending' : 'saved')
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(initial.revision)
  const [, setHistoryVersion] = useState(0)
  const [tick, setTick] = useState(0)
  const current = useRef(workspace)
  const base = useRef(recovery?.base || initial)
  const saving = useRef(false)
  const blocked = useRef(false)
  const deferred = useRef<Envelope | null>(null)
  const undoStack = useRef<HistoryItem[]>([])
  const redoStack = useRef<HistoryItem[]>([])
  const lastCheckpoint = useRef(0)
  const publish = useCallback((value: Workspace) => {
    current.current = value
    setWorkspace(value)
  }, [])
  const persistDraft = useCallback(() => {
    try {
      if (diffWorkspace(base.current.workspace, current.current).length)
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            base: base.current,
            workspace: current.current,
            writeVersion,
          }),
        )
      else sessionStorage.removeItem(storageKey)
    } catch {
      /* beforeunload also protects pending edits. */
    }
  }, [storageKey])
  const receive = useCallback(
    (incoming: Envelope) => {
      if (incoming.revision <= base.current.revision) return
      if (saving.current || blocked.current) {
        if (!deferred.current || incoming.revision > deferred.current.revision)
          deferred.current = incoming
        return
      }
      try {
        const pending = diffWorkspace(base.current.workspace, current.current)
        if (!canRebaseOperations(pending)) throw new Error('Stale removal')
        const merged = applyOperations(incoming.workspace, pending)
        base.current = incoming
        publish(keepViews(merged, current.current))
        setRevision(incoming.revision)
        persistDraft()
        if (!diffWorkspace(incoming.workspace, merged).length) {
          setSaveState('saved')
          setError('')
        }
      } catch {
        blocked.current = true
        deferred.current = incoming
        setError(
          'A newer version arrived while this tab had conflicting edits or removals. Nothing from this draft was applied. Export your edits, then load the latest saved version.',
        )
        setSaveState('error')
      }
    },
    [persistDraft, publish],
  )
  const flush = useCallback(async () => {
    if (saving.current || blocked.current) return false
    let operations = diffWorkspace(base.current.workspace, current.current)
    if (!operations.length) {
      setSaveState('saved')
      persistDraft()
      return true
    }
    saving.current = true
    setSaveState('saving')
    setError('')
    try {
      let retries = 0
      while (operations.length) {
        const sent = structuredClone(current.current)
        let result: Envelope
        try {
          result = await request<Envelope>('/api/workspace', {
            method: 'PATCH',
            headers: {
              ...workspaceHeaders(workspaceId),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requestId: crypto.randomUUID(),
              baseRevision: base.current.revision,
              operations,
            }),
          })
        } catch (err) {
          // Only current-session, non-deleting edits may rebase after a race.
          // A stale deletion or replacement must be reviewed by the user.
          if (
            err instanceof ApiError &&
            err.code === 'STALE_REVISION' &&
            retries++ < 3 &&
            canRebaseOperations(operations)
          ) {
            const latest = await request<Envelope>('/api/workspace', {
              headers: workspaceHeaders(workspaceId),
            })
            const rebased = applyOperations(latest.workspace, operations)
            const additional = diffWorkspace(sent, current.current)
            if (!canRebaseOperations(additional))
              throw new MergeConflict(['stale removal'])
            const next = applyOperations(rebased, additional)
            base.current = latest
            publish(keepViews(next, current.current))
            setRevision(latest.revision)
            persistDraft()
            operations = diffWorkspace(latest.workspace, next)
            continue
          }
          throw err
        }
        const newerLocalEdits = diffWorkspace(sent, current.current)
        const next = keepViews(
          applyOperations(result.workspace, newerLocalEdits),
          current.current,
        )
        base.current = result
        publish(next)
        setRevision(result.revision)
        persistDraft()
        operations = diffWorkspace(base.current.workspace, current.current)
      }
      setSaveState('saved')
      return true
    } catch (err) {
      if (
        err instanceof MergeConflict ||
        (err instanceof ApiError && [409, 428].includes(err.status))
      )
        blocked.current = true
      setError(err instanceof Error ? err.message : 'Save failed.')
      setSaveState('error')
      persistDraft()
      return false
    } finally {
      saving.current = false
      if (deferred.current && !blocked.current) {
        const latest = deferred.current
        deferred.current = null
        receive(latest)
      }
    }
  }, [persistDraft, publish, receive, workspaceId])
  const apply = useCallback(
    (next: Workspace) => {
      const changed = diffWorkspace(current.current, next).length > 0
      publish(next)
      try {
        sessionStorage.setItem(
          cameraKey,
          JSON.stringify(
            Object.fromEntries(
              next.boards.flatMap((b) => [
                [b.id, b.viewport],
                [b.id + ':wireframes', b.wireframeViewport],
              ]),
            ),
          ),
        )
      } catch {
        /* Camera persistence is optional. */
      }
      if (!changed) return
      setSaveState(blocked.current ? 'error' : 'pending')
      persistDraft()
      setTick((v) => v + 1)
    },
    [persistDraft, publish, cameraKey],
  )
  const checkpoint = useCallback(() => {
    if (undoStack.current.at(-1)?.length === 0) undoStack.current.pop()
    undoStack.current = [...undoStack.current.slice(-49), []]
    redoStack.current = []
    lastCheckpoint.current = Date.now()
    setHistoryVersion((v) => v + 1)
  }, [])
  const change = useCallback(
    (update: (value: Workspace) => Workspace, record = true) => {
      const next = update(current.current)
      const operations = diffWorkspace(current.current, next)
      if (operations.length) {
        if (
          (record && Date.now() - lastCheckpoint.current > 500) ||
          !undoStack.current.length
        )
          checkpoint()
        undoStack.current.at(-1)!.push(operations)
        redoStack.current = []
      }
      apply(next)
    },
    [apply, checkpoint],
  )
  const travel = useCallback(
    (backwards: boolean) => {
      const source = backwards ? undoStack : redoStack
      const target = backwards ? redoStack : undoStack
      while (source.current.at(-1)?.length === 0) source.current.pop()
      const entry = source.current.at(-1)
      if (!entry) return
      try {
        let next = current.current
        const steps = backwards
          ? [...entry].reverse().map((ops) =>
              [...ops].reverse().map((op) => ({
                path: op.path,
                before: op.after,
                after: op.before,
              })),
            )
          : entry
        for (const operations of steps)
          next = keepViews(applyOperations(next, operations), next)
        source.current.pop()
        target.current.push(entry)
        apply(next)
        lastCheckpoint.current = 0
        setHistoryVersion((v) => v + 1)
      } catch {
        setError(
          'Cannot undo or redo this change because a collaborator changed the same item. Their work has been kept.',
        )
      }
    },
    [apply],
  )
  useEffect(() => {
    receive(initial)
  }, [initial, receive])
  useEffect(() => {
    const timer = setTimeout(() => void flush(), 250)
    return () => clearTimeout(timer)
  }, [tick, flush])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (diffWorkspace(base.current.workspace, current.current).length) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])
  const reloadSaved = async () => {
    try {
      const latest = await request<Envelope>('/api/workspace', {
        headers: workspaceHeaders(workspaceId),
      })
      base.current = latest
      blocked.current = false
      deferred.current = null
      publish(keepViews(latest.workspace, current.current))
      setRevision(latest.revision)
      undoStack.current = []
      redoStack.current = []
      persistDraft()
      setSaveState('saved')
      setError('')
    } catch (err) {
      setError(String(err))
    }
  }
  return {
    workspace,
    change,
    checkpoint,
    saveState,
    error,
    revision,
    flush,
    receive,
    undo: () => travel(true),
    redo: () => travel(false),
    reloadSaved,
    canUndo: undoStack.current.some((item) => item.length),
    canRedo: redoStack.current.some((item) => item.length),
  }
}
