import type { Recovery } from '@/entities/workspace/index.ts'
import type { Profile } from '@aril/domain/collaboration'
import type { StudioSummary } from '@aril/domain/studios'
import type { Envelope } from '@aril/domain/workspace'
export type StudioProps = {
  active?: boolean
  onCloseWorkspace?: (id: string) => void
  initial: Envelope
  recovery?: Recovery
  initialProfile: Profile
  studio: StudioSummary
  onWorkspaces: (profile: Profile) => void
  onOpenWorkspace: (studio: StudioSummary) => void
}
