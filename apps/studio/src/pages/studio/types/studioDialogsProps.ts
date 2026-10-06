import { useWorkspace } from '@/entities/workspace/index.ts'
import { useStudioModel } from '../model/useStudioModel.ts'
import type { StudioProps } from './studioProps.ts'

export type StudioDialogsProps = {
  setModal: ReturnType<typeof useStudioModel>['setModal']
  modal:
    'delete' | 'new' | 'history' | 'import' | 'export' | 'reload' | 'agents'
  studio: StudioProps['studio']
  exportWorkspace: () => void
  state: ReturnType<typeof useWorkspace>
  workspace: ReturnType<typeof useWorkspace>['workspace']
  setNotice: ReturnType<typeof useStudioModel>['setNotice']
  downloadWorkspace: () => void
  change: ReturnType<typeof useWorkspace>['change']
  boardName: string
  setBoardId: ReturnType<typeof useStudioModel>['setBoardId']
  setView: ReturnType<typeof useStudioModel>['setView']
  setBoardName: ReturnType<typeof useStudioModel>['setBoardName']
  board: ReturnType<typeof useWorkspace>['workspace']['boards'][number]
  pendingImport: ReturnType<typeof useStudioModel>['pendingImport']
  historyLoading: boolean
  snapshots: { revision: number; savedAt: string }[]
}
