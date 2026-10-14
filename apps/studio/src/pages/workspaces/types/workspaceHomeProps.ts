import type { Profile } from '@aril/domain/collaboration'
import type { StudioSummary } from '@aril/domain/studios'
export type WorkspaceHomeProps = {
  onProfile: (profile: Profile) => void
  profile: Profile
  onOpen: (studio: StudioSummary) => void
  notice?: string
}
