import type { StudioOverview, StudioSummary } from '@pomegranate/domain/studios'
export type WorkspaceCardProps = {
  studio: StudioOverview
  visited?: number
  onOpen: (studio: StudioSummary) => void
}
