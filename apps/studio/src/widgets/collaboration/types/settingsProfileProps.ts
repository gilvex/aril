import type { Profile } from '@aril/domain/collaboration'
export type SettingsProfileProps = {
  profile: Profile
  onProfile: (profile: Profile) => void
  beforeLeave: () => Promise<boolean>
}
