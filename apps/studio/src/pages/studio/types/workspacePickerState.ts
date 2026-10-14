import type { StudioSummary } from '@aril/domain/studios'
export type WorkspacePickerState = {
  items: StudioSummary[]
  query: string
  loading: boolean
  busy: boolean
  error: string
}
