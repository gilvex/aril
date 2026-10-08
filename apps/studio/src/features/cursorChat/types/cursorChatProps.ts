import type { LiveState } from '@pomegranate/domain/liveSession'
export type CursorChatProps = {
  root?: import('react').RefObject<HTMLDivElement | null>
  toolbar?: boolean
  profile: import('@pomegranate/domain/collaboration').Profile
  active: boolean
  scope: string
  sendPresence: (changes: Partial<LiveState>, force?: boolean) => void
}
