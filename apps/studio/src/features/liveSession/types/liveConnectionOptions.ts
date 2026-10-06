import type { openLiveChannel } from '@/features/liveSession/model/requests/openLiveChannel.ts'
import type { Presence } from '@pomegranate/domain/collaboration'
import type { LiveState } from '@pomegranate/domain/liveSession'
export type LiveConnectionOptions = {
  workspaceId: string
  clientId: string
  read: () => LiveState
  peers: (value: Presence[]) => void
  connected: (value: boolean) => void
  ready: (session: Awaited<ReturnType<typeof openLiveChannel>>) => void
}
