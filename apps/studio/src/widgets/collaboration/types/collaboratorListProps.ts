import type { Profile } from '@pomegranate/domain/collaboration'

export type CollaboratorListProps = {
  peers: import('@pomegranate/domain/collaboration').Presence[]
  connected: boolean
  followId: string | null
  onFollow: (id: string | null) => void
  setPanel: (panel: import('../types/collaborationBarPanel.ts').Panel) => void
  profile: Profile
}
