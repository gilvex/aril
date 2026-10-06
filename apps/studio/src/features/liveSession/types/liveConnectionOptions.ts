import type { Presence } from '@pomegranate/domain/collaboration'
import type { LiveState } from '@pomegranate/domain/liveSession'
import type { openLiveChannel } from '../model/requests/openLiveChannel.ts'
export type LiveConnectionOptions = {
  workspaceId: string
  clientId: string
  read: () => LiveState
  peers: (value: Presence[]) => void
  connected: (value: boolean) => void
  ready: (session: Awaited<ReturnType<typeof openLiveChannel>>) => void
}
