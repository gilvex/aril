import type { WorkspaceManagement } from './workspaceManagement.ts'
import type { SubmitEvent } from 'react'
export type WorkspaceManageDialogProps = {
  management: WorkspaceManagement
  name: string
  busy: boolean
  error: string
  onName: (name: string) => void
  onClose: () => void
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void
}
