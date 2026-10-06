import { createWorkspaceSession } from '@/entities/workspace/model/createWorkspaceSession.ts'
import type { Recovery } from '@/entities/workspace/types/recovery.ts'
import type { Envelope } from '@pomegranate/domain/workspace'
import { useEffect, useRef, useSyncExternalStore } from 'react'
export function useWorkspace(
  initial: Envelope,
  workspaceId: string,
  profileId: string,
  recovery?: Recovery,
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
  return {
    ...snapshot,
    change: session.change,
    checkpoint: session.checkpoint,
    flush: session.flush,
    receive: session.receive,
    undo: session.undo,
    redo: session.redo,
    reloadSaved: session.reloadSaved,
  }
}
