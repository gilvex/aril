import { useWorkspace } from '@/entities/workspace/index.ts'
import { useCanvasFullscreen } from '@/features/canvasFullscreen/index.ts'
import { useMultiplayer } from '@/features/liveSession/index.ts'
import type { StudioView as View } from '@/shared/types/studioView.ts'
import type { Presence } from '@pomegranate/domain/collaboration'
import type * as React from 'react'
import { useStudioModel } from '../model/useStudioModel.ts'
import type { StudioProps } from './studioProps.ts'

export type StudioHeaderProps = {
  state: ReturnType<typeof useWorkspace>
  onWorkspaces: StudioProps['onWorkspaces']
  onOpenWorkspace: StudioProps['onOpenWorkspace']
  multiplayer: ReturnType<typeof useMultiplayer>
  setNotice: ReturnType<typeof useStudioModel>['setNotice']
  studio: StudioProps['studio']
  compact: boolean
  sidebarOpen: boolean
  view: View
  setView: ReturnType<typeof useStudioModel>['setView']
  setRequirementId: ReturnType<typeof useStudioModel>['setRequirementId']
  present: Pick<Presence, 'profile' | 'view' | 'boardId'>[]
  actionsMenu: React.RefObject<HTMLDetailsElement | null>
  setCollaborationPanel: ReturnType<
    typeof useStudioModel
  >['setCollaborationPanel']
  setModal: ReturnType<typeof useStudioModel>['setModal']
  loadHistory: () => Promise<void>
  importRef: React.RefObject<HTMLInputElement | null>
  exportWorkspace: () => void
  full: ReturnType<typeof useCanvasFullscreen>
  collaborationPanel: 'profile' | 'activity' | 'people' | null
  followId: string | null
  setFollowId: ReturnType<typeof useStudioModel>['setFollowId']
}
