import type { Profile } from '@pomegranate/domain/collaboration'
export type SettingsInvitationsProps = {
  workspaceId: string
  profile: Profile
  beforeLeave: () => Promise<boolean>
}
