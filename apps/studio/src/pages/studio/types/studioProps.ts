import type { Recovery } from '@/entities/workspace/index.ts'
import type { Profile } from '@pomegranate/domain/collaboration'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { Envelope } from '@pomegranate/domain/workspace'
export type StudioProps = {
  initial: Envelope
  recovery?: Recovery
  initialProfile: Profile
  studio: StudioSummary
  onWorkspaces: (profile: Profile) => void
  onOpenWorkspace: (studio: StudioSummary) => void
}
