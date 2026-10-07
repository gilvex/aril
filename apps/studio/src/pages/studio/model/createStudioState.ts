import type { Recovery } from '@/entities/workspace/index.ts'
import type { StudioRoute } from '@/shared/types/studioRoute.ts'
import type { StudioView as View } from '@/shared/types/studioView.ts'
import { readStudioRoute } from '@/shared/utils/readStudioRoute.ts'
import type { Workspace } from '@pomegranate/domain/workspace'
export function createStudioState(
  workspace: Workspace,
  recovery: Recovery | undefined,
) {
  const initialRoute: StudioRoute = (() =>
    readStudioRoute(location.pathname + location.search))()
  const view: View = initialRoute.view
  const canvasMode: 'canvas' | 'wireframes' = initialRoute.canvasMode
  const boardId: string = initialRoute.boardId || workspace.boards[0].id
  const requirementId: string | null = (() =>
    workspace.requirements.some(
      (item) => item.id === initialRoute.requirementId,
    )
      ? initialRoute.requirementId!
      : null)()
  const sidebarOpen: boolean = false
  const collaborationPanel: 'profile' | 'people' | 'activity' | null = null
  const notice: string = recovery
    ? 'Recovered unsaved edits from this tab.'
    : ''
  const modal:
    | 'new'
    | 'history'
    | 'delete'
    | 'import'
    | 'export'
    | 'reload'
    | 'agents'
    | null = null
  const boardName: string = ''
  const pendingImport: Workspace | null = null
  const snapshots: { revision: number; savedAt: string }[] = []
  const historyLoading: boolean = false
  const followId: string | null = null
  return {
    initialRoute,
    view,
    canvasMode,
    boardId,
    requirementId,
    sidebarOpen,
    navigationCollapsed: false,
    collaborationPanel,
    notice,
    modal,
    boardName,
    pendingImport,
    snapshots,
    historyLoading,
    followId,
  }
}
