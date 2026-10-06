import type { Profile } from '@pomegranate/domain/collaboration'
export type WorkspaceAccountMenuProps = {
  profile: Profile
  onProfile: (profile: Profile) => void
}
