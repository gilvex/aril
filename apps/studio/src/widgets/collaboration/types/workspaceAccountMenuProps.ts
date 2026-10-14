import type { Profile } from '@aril/domain/collaboration'
export type WorkspaceAccountMenuProps = {
  profile: Profile
  onProfile: (profile: Profile) => void
}
