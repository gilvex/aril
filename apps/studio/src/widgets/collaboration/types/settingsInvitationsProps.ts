import type { Profile } from '@aril/domain/collaboration'
export type SettingsInvitationsProps = {
  workspaceId: string
  profile: Profile
  beforeLeave: () => Promise<boolean>
}
