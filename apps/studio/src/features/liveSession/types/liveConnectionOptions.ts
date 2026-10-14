import type { openLiveChannel } from '@/features/liveSession/model/requests/openLiveChannel.ts'
import type { Presence } from '@aril/domain/collaboration'
import type { LiveState } from '@aril/domain/liveSession'
export type LiveConnectionOptions = {
  noteText: (
    message: import('@aril/domain/liveSession').LiveDocumentMessage,
  ) => void
  workspaceId: string
  clientId: string
  read: () => LiveState
  peers: (value: Presence[]) => void
  connected: (value: boolean) => void
  ready: (session: Awaited<ReturnType<typeof openLiveChannel>>) => void
}
