import type { StudioSummary } from '@pomegranate/domain/studios'
export type WorkspacePickerDialogProps = {
  current: StudioSummary
  beforeLeave: () => Promise<boolean>
  onOpen: (studio: StudioSummary) => void
  close: () => void
}
