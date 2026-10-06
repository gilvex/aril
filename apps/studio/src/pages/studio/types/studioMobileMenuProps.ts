import { useWorkspace } from '@/entities/workspace/index.ts'
import { useMultiplayer } from '@/features/liveSession/index.ts'
import type * as React from 'react'
import { useStudioModel } from '../model/useStudioModel.ts'
import type { StudioProps } from './studioProps.ts'

export type StudioMobileMenuProps = {
  sidebarRef: React.RefObject<HTMLElement | null>
  sidebarOpen: boolean
  setSidebarOpen: ReturnType<typeof useStudioModel>['setSidebarOpen']
  state: ReturnType<typeof useWorkspace>
  onWorkspaces: StudioProps['onWorkspaces']
  multiplayer: ReturnType<typeof useMultiplayer>
  setNotice: ReturnType<typeof useStudioModel>['setNotice']
  studio: StudioProps['studio']
  setCollaborationPanel: ReturnType<
    typeof useStudioModel
  >['setCollaborationPanel']
  setModal: ReturnType<typeof useStudioModel>['setModal']
  loadHistory: () => Promise<void>
  importRef: React.RefObject<HTMLInputElement | null>
  exportWorkspace: () => void
}
