import type { LiveState } from '@pomegranate/domain/liveSession'
export type CursorChatProps = {
  active: boolean
  scope: string
  sendPresence: (changes: Partial<LiveState>, force?: boolean) => void
}
