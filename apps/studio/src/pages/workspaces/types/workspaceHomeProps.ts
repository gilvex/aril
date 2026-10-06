import type { Profile } from '@pomegranate/domain/collaboration'
import type { StudioSummary } from '@pomegranate/domain/studios'
export type WorkspaceHomeProps = {
  onProfile: (profile: Profile) => void
  profile: Profile
  onOpen: (studio: StudioSummary) => void
  notice?: string
}
