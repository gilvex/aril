import { viewsKey } from '@/entities/workspace/config/viewsKey.ts'
import { flushWorkspace } from '@/entities/workspace/model/iterators/flushWorkspace.ts'
import { reloadWorkspace } from '@/entities/workspace/model/iterators/reloadWorkspace.ts'
import { workspaceSaga } from '@/entities/workspace/model/saga/workspaceSaga.ts'
import { workspaceSlice } from '@/entities/workspace/model/slices/workspaceSlice.ts'
import type { HistoryItem } from '@/entities/workspace/types/historyItem.ts'
import type { Recovery } from '@/entities/workspace/types/recovery.ts'
import type { WorkspaceRuntime } from '@/entities/workspace/types/workspaceRuntime.ts'
import { keepViews } from '@/entities/workspace/utils/keepViews.ts'
import { loadViews } from '@/entities/workspace/utils/loadViews.ts'
import { scopedDraftKey } from '@/entities/workspace/utils/scopedDraftKey.ts'
import {
  applyOperations,
  diffWorkspace,
} from '@pomegranate/domain/collaboration'
import {
  canRebaseOperations,
  writeVersion,
} from '@pomegranate/domain/freshness'
import type { Envelope, Workspace } from '@pomegranate/domain/workspace'
import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
export function createWorkspaceSession(
  initial: Envelope,
  workspaceId: string,
  profileId: string,
  recovery?: Recovery,
) {
  const storageKey = scopedDraftKey(workspaceId, profileId)
  const cameraKey = `${viewsKey}:${profileId}:${workspaceId}`
  const workspace = loadViews(
    recovery?.workspace || initial.workspace,
    cameraKey,
  )
  const saga = createSagaMiddleware()
  const store = configureStore({
    reducer: workspaceSlice.reducer,
    preloadedState: {
      workspace,
      saveState: recovery ? 'pending' : 'saved',
      error: '',
      revision: initial.revision,
      historyVersion: 0,
      tick: 0,
      canUndo: false,
      canRedo: false,
    },
    middleware: (defaults) => defaults({ thunk: false }).concat(saga),
    devTools: false,
  })
  const setWorkspace = (value: Workspace) => {
    store.dispatch(workspaceSlice.actions.workspaceChanged(value))
  }
  const setSaveState = (value: 'saved' | 'pending' | 'saving' | 'error') => {
    store.dispatch(workspaceSlice.actions.saveStateChanged(value))
  }
  const setError = (value: string) => {
    store.dispatch(workspaceSlice.actions.errorChanged(value))
  }
  const setRevision = (value: number) => {
    store.dispatch(workspaceSlice.actions.revisionChanged(value))
  }
  const setHistoryVersion = () => {
    store.dispatch(
      workspaceSlice.actions.historyChanged({
        canUndo: undoStack.current.some((item) => item.length),
        canRedo: redoStack.current.some((item) => item.length),
      }),
    )
  }
  const setTick = () => {
    store.dispatch(workspaceSlice.actions.editQueued())
  }
  const current = { current: workspace }
  const base = { current: recovery?.base || initial }
  const saving = { current: false }
  const blocked = { current: false }
  const deferred = { current: null } as { current: Envelope | null }
  const undoStack = { current: [] } as { current: HistoryItem[] }
  const redoStack = { current: [] } as { current: HistoryItem[] }
  const lastCheckpoint = { current: 0 }
  const publish = (value: Workspace) => {
    current.current = value
    setWorkspace(value)
  }
  const persistDraft = () => {
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
  }
  const receive = (incoming: Envelope) => {
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
  }

  const apply = (next: Workspace) => {
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
    setTick()
  }
  const checkpoint = () => {
    if (undoStack.current.at(-1)?.length === 0) undoStack.current.pop()
    undoStack.current = [...undoStack.current.slice(-49), []]
    redoStack.current = []
    lastCheckpoint.current = Date.now()
    setHistoryVersion()
  }
  const change = (
    update: (value: Workspace) => Workspace,
    record = true,
    historyBase?: (value: Workspace) => Workspace,
  ) => {
    const next = update(current.current)
    const operations = diffWorkspace(
      historyBase ? historyBase(current.current) : current.current,
      next,
    )
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
    setHistoryVersion()
  }
  const travel = (backwards: boolean) => {
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
      target.current.push([
        backwards
          ? diffWorkspace(next, current.current)
          : diffWorkspace(current.current, next),
      ])
      apply(next)
      lastCheckpoint.current = 0
      setHistoryVersion()
    } catch {
      setError(
        'Cannot undo or redo this change because a collaborator changed the same item. Their work has been kept.',
      )
    }
  }

  const runtime: WorkspaceRuntime = {
    saving,
    blocked,
    base,
    current,
    deferred,
    setSaveState,
    persistDraft,
    setError,
    workspaceId,
    publish,
    setRevision,
    receive,
    undoStack,
    redoStack,
    setHistoryVersion,
  }
  const flush = () => saga.run(flushWorkspace, runtime).toPromise()
  return {
    store,
    change,
    checkpoint,
    flush,
    receive,
    hasPending: () =>
      diffWorkspace(base.current.workspace, current.current).length > 0,
    undo: () => travel(true),
    redo: () => travel(false),
    reloadSaved: () => saga.run(reloadWorkspace, runtime).toPromise(),
    start: () => {
      const task = saga.run(workspaceSaga, flush)
      store.dispatch(workspaceSlice.actions.editQueued())
      return () => task.cancel()
    },
  }
}
