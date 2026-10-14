import type { StudioOverview } from '@aril/domain/studios'

export type WorkspaceHomeState = {
  search: string
  sort: import('./workspaceSort.ts').WorkspaceSort
  studios: StudioOverview[] | null
  name: string
  creating: boolean
  busy: boolean
  error: string
  hostedOrigin: string | null
}
