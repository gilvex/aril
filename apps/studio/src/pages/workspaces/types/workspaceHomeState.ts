import type { StudioSummary } from '@pomegranate/domain/studios'

export type WorkspaceHomeState = {
  studios: StudioSummary[] | null
  name: string
  creating: boolean
  busy: boolean
  error: string
  hostedOrigin: string | null
}
