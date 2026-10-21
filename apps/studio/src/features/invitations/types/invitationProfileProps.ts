import type { Profile } from '@aril/domain/collaboration'
export type InvitationProfileProps = {
  profile: Profile
  onProfile: (profile: Profile) => void
}
