import { useEffect } from 'react'
import { runSaga } from 'redux-saga'
import type { useWorkspace } from '@/entities/workspace/index.ts'
import type { useMultiplayer } from '@/features/liveSession/index.ts'
import { shareWorkspaceFields } from './iterators/shareWorkspaceFields.ts'
export function useLiveWorkspaceFields(
  state: ReturnType<typeof useWorkspace>,
  multiplayer: ReturnType<typeof useMultiplayer>,
  enabled: boolean,
  canEdit: boolean,
) {
  const { receiveFields, pruneFields, pendingFields, subscribeFields } = state
  const { liveDocuments, clientId } = multiplayer
  useEffect(() => {
    if (!enabled) return
    const task = runSaga({}, shareWorkspaceFields, {
      receiveFields,
      pruneFields,
      pendingFields,
      subscribeFields,
      channel: liveDocuments,
      clientId,
      canEdit,
    })
    return () => task.cancel()
  }, [
    enabled,
    canEdit,
    receiveFields,
    pruneFields,
    pendingFields,
    subscribeFields,
    liveDocuments,
    clientId,
  ])
}
