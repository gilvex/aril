import type { StudioSummary } from '@aril/domain/studios'
export type WorkspaceManagement = {
  studio: StudioSummary
  mode: 'rename' | 'delete'
}
