import type { StudioOverview, StudioSummary } from '@aril/domain/studios'
export type WorkspaceCardProps = {
  studio: StudioOverview
  onManage?: (studio: StudioSummary, mode: 'rename' | 'delete') => void
  visited?: number
  onOpen: (studio: StudioSummary) => void
}
