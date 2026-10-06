import type { Profile } from '@pomegranate/domain/collaboration'
import type { StudioSummary } from '@pomegranate/domain/studios'
export type WorkspaceHomeProps = {
  profile: Profile
  onOpen: (studio: StudioSummary) => void
  notice?: string
}
