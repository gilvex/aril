import type { LiveState } from '@aril/domain/liveSession'
export type CursorChatProps = {
  root?: import('react').RefObject<HTMLDivElement | null>
  toolbar?: boolean
  profile: import('@aril/domain/collaboration').Profile
  active: boolean
  scope: string
  sendPresence: (changes: Partial<LiveState>, force?: boolean) => void
}
