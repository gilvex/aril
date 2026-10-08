import type { LiveState } from '@pomegranate/domain/liveSession'
export type CursorChatProps = {
  profile: import('@pomegranate/domain/collaboration').Profile
  active: boolean
  scope: string
  sendPresence: (changes: Partial<LiveState>, force?: boolean) => void
}
