import type { Profile } from '@aril/domain/collaboration'

export type FollowPersonProps = {
  person:
    | import('@aril/domain/collaboration').Presence
    | { profile: Profile; clientId: string; view: string; following: null }
  connected: boolean
  followId: string | null
  onFollow: (id: string | null) => void
  setPanel: (panel: import('../types/collaborationBarPanel.ts').Panel) => void
  profile: Profile
}
