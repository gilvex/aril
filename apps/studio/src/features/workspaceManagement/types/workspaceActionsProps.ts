import type { ReactElement } from 'react'
import type { StudioSummary } from '@aril/domain/studios'
export type WorkspaceActionsProps = {
  studio: StudioSummary
  onManage?: (studio: StudioSummary, mode: 'rename' | 'delete') => void
  children?: ReactElement
}
