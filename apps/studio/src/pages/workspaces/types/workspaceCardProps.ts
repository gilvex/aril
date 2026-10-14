import type { StudioOverview, StudioSummary } from '@aril/domain/studios'
export type WorkspaceCardProps = {
  studio: StudioOverview
  visited?: number
  onOpen: (studio: StudioSummary) => void
}
