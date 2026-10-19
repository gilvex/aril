import type { StudioOverview } from '@aril/domain/studios'

export type WorkspaceHomeState = {
  management: import('./workspaceManagement.ts').WorkspaceManagement | null
  search: string
  sort: import('./workspaceSort.ts').WorkspaceSort
  studios: StudioOverview[] | null
  name: string
  creating: boolean
  busy: boolean
  error: string
  hostedOrigin: string | null
}
