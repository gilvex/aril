import type { StudioRoute } from '@/shared/types/studioRoute.ts'
import type { StudioView as View } from '@/shared/types/studioView.ts'
import type { Workspace } from '@pomegranate/domain/workspace'
export type StudioState = {
  initialRoute: StudioRoute
  view: View
  canvasMode: 'canvas' | 'wireframes'
  boardId: string
  requirementId: string | null
  sidebarOpen: boolean
  collaborationPanel: 'profile' | 'people' | 'activity' | null
  notice: string
  modal:
    | 'new'
    | 'history'
    | 'delete'
    | 'import'
    | 'export'
    | 'reload'
    | 'agents'
    | null
  boardName: string
  pendingImport: Workspace | null
  snapshots: { revision: number; savedAt: string }[]
  historyLoading: boolean
  followId: string | null
}
