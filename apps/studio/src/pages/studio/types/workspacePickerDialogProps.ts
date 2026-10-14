import type { StudioSummary } from '@aril/domain/studios'
export type WorkspacePickerDialogProps = {
  current: StudioSummary
  beforeLeave: () => Promise<boolean>
  onOpen: (studio: StudioSummary) => void
  close: () => void
}
