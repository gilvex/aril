import type { StudioSummary } from '@pomegranate/domain/studios'
export type WorkspacePickerState = {
  items: StudioSummary[]
  query: string
  loading: boolean
  busy: boolean
  error: string
}
