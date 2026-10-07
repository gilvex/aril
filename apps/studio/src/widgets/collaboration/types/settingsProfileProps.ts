import type { Profile } from '@pomegranate/domain/collaboration'
export type SettingsProfileProps = {
  profile: Profile
  onProfile: (profile: Profile) => void
  beforeLeave: () => Promise<boolean>
}
