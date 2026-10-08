import { setNoteText, type NoteTextState } from '@pomegranate/domain/noteText'
import { diffWorkspace } from '@pomegranate/domain/collaboration'
import { createWorkspaceSession } from '@/entities/workspace/model/createWorkspaceSession.ts'
import type { Recovery } from '@/entities/workspace/types/recovery.ts'
import type { Envelope } from '@pomegranate/domain/workspace'
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
export function useWorkspace(
  initial: Envelope,
  workspaceId: string,
  profileId: string,
  recovery?: Recovery,
  canEdit = true,
) {
  const sessionRef = useRef<ReturnType<typeof createWorkspaceSession> | null>(
    null,
  )
  if (!sessionRef.current)
    sessionRef.current = createWorkspaceSession(
      initial,
      workspaceId,
      profileId,
      recovery,
    )
  const session = sessionRef.current
  const snapshot = useSyncExternalStore(
    session.store.subscribe,
    session.store.getState,
  )
  useEffect(() => {
    const stop = session.start()
    const warn = (event: BeforeUnloadEvent) => {
      if (session.hasPending()) {
        event.preventDefault()
        event.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => {
      stop()
      window.removeEventListener('beforeunload', warn)
    }
  }, [session])
  useEffect(() => session.receive(initial), [session, initial])
  const change = useCallback<typeof session.change>(
    (update, record, historyBase) => {
      session.change(
        (current) => {
          const next = update(current)
          return canEdit || !diffWorkspace(current, next).length
            ? next
            : current
        },
        record,
        historyBase,
      )
    },
    [canEdit, session],
  )
  const changeText = useCallback(
    (id: string, before: NoteTextState, after: NoteTextState) => {
      if (canEdit)
        session.change(
          (value) => setNoteText(value, id, after),
          true,
          (value) => setNoteText(value, id, before),
        )
    },
    [canEdit, session],
  )
  const undo = useCallback(() => {
    if (canEdit) session.undo()
  }, [canEdit, session])
  const redo = useCallback(() => {
    if (canEdit) session.redo()
  }, [canEdit, session])
  return {
    ...snapshot,
    canUndo: canEdit && snapshot.canUndo,
    canRedo: canEdit && snapshot.canRedo,
    change,
    changeText,
    checkpoint: session.checkpoint,
    flush: session.flush,
    receive: session.receive,
    undo,
    redo,
    reloadSaved: session.reloadSaved,
  }
}
