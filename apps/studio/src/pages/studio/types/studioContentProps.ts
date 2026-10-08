import type { StudioView as View } from '@/shared/types/studioView.ts'

export type StudioContentProps = {
  settings: ReturnType<typeof import('../model/useSettings.ts').useSettings>
  onOpenWorkspace: import('./studioProps.ts').StudioProps['onOpenWorkspace']
  compact: boolean
  sidebarOpen: boolean
  navigationCollapsed: boolean
  setNavigationCollapsed: (value: boolean) => void
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
  onWorkspaces: (
    profile: import('@pomegranate/domain/collaboration').Profile,
  ) => void
  multiplayer: ReturnType<
    typeof import('@/features/liveSession/index.ts').useMultiplayer
  >
  setNotice: (
    value:
      | import('../types/studioState.ts').StudioState['notice']
      | ((
          current: import('../types/studioState.ts').StudioState['notice'],
        ) => import('../types/studioState.ts').StudioState['notice']),
  ) => void
  studio: import('@pomegranate/domain/studios').StudioSummary
  view: View
  setView: (
    value:
      | import('../types/studioState.ts').StudioState['view']
      | ((
          current: import('../types/studioState.ts').StudioState['view'],
        ) => import('../types/studioState.ts').StudioState['view']),
  ) => void
  setRequirementId: (
    value:
      | import('../types/studioState.ts').StudioState['requirementId']
      | ((
          current: import('../types/studioState.ts').StudioState['requirementId'],
        ) => import('../types/studioState.ts').StudioState['requirementId']),
  ) => void
  present: (
    | import('@pomegranate/domain/collaboration').Presence
    | {
        profile: import('@pomegranate/domain/collaboration').Profile
        view:
          | 'canvas'
          | 'requirements'
          | 'design'
          | 'notes'
          | 'wireframes'
          | 'settings'
        boardId: string | null
      }
  )[]
  actionsMenu: import('react').RefObject<HTMLDetailsElement | null>
  setCollaborationPanel: (
    value:
      | import('../types/studioState.ts').StudioState['collaborationPanel']
      | ((
          current: import('../types/studioState.ts').StudioState['collaborationPanel'],
        ) => import('../types/studioState.ts').StudioState['collaborationPanel']),
  ) => void
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
  loadHistory: () => Promise<void>
  importRef: import('react').RefObject<HTMLInputElement | null>
  exportWorkspace: () => void
  full: {
    element: import('react').RefObject<HTMLDivElement | null>
    button: import('react').RefObject<HTMLButtonElement | null>
    fullscreen: boolean
    toggle: () => Promise<void>
  }
  collaborationPanel: 'profile' | 'people' | 'activity' | null
  followId: string | null
  setFollowId: (
    value:
      | import('../types/studioState.ts').StudioState['followId']
      | ((
          current: import('../types/studioState.ts').StudioState['followId'],
        ) => import('../types/studioState.ts').StudioState['followId']),
  ) => void
  followStatus: import('react').JSX.Element | null
  setPendingImport: (
    value:
      | import('../types/studioState.ts').StudioState['pendingImport']
      | ((
          current: import('../types/studioState.ts').StudioState['pendingImport'],
        ) => import('../types/studioState.ts').StudioState['pendingImport']),
  ) => void
  notice: string
  BoardCanvas: import('react').LazyExoticComponent<
    ({
      full,
      navigation,
      following,
      board,
      requirements,
      update,
      checkpoint,
      openRequirement,
      peers,
      sendPresence,
      saveState,
      profile,
    }: import('../../../widgets/board/types/canvasBoardProps.ts').CanvasBoardProps) => import('react').JSX.Element
  >
  board: import('@pomegranate/domain/workspace').Board
  canvasMode: 'canvas' | 'wireframes' | 'design'
  followed: import('@pomegranate/domain/collaboration').Presence | null
  workspace: import('@pomegranate/domain/workspace').Workspace
  setBoardId: (
    value:
      | import('../types/studioState.ts').StudioState['boardId']
      | ((
          current: import('../types/studioState.ts').StudioState['boardId'],
        ) => import('../types/studioState.ts').StudioState['boardId']),
  ) => void
  setCanvasMode: (
    value:
      | import('../types/studioState.ts').StudioState['canvasMode']
      | ((
          current: import('../types/studioState.ts').StudioState['canvasMode'],
        ) => import('../types/studioState.ts').StudioState['canvasMode']),
  ) => void
  setBoardName: (
    value:
      | import('../types/studioState.ts').StudioState['boardName']
      | ((
          current: import('../types/studioState.ts').StudioState['boardName'],
        ) => import('../types/studioState.ts').StudioState['boardName']),
  ) => void
  change: (
    update: (
      value: import('@pomegranate/domain/workspace').Workspace,
    ) => import('@pomegranate/domain/workspace').Workspace,
    record?: boolean,
  ) => void
  sendPresence: (
    changes: Partial<{
      camera: { x: number; y: number; zoom: number } | null
      following: string | null
      clientId: string
      boardId: string | null
      view:
        | 'canvas'
        | 'requirements'
        | 'design'
        | 'notes'
        | 'wireframes'
        | 'settings'
      cursor: { x: number; y: number } | null
      selected: string[]
      selectedEdges: string[]
      requirement: {
        id: string
        field:
          | 'description'
          | 'title'
          | 'status'
          | 'category'
          | 'priority'
          | 'acceptance'
          | null
        typing: boolean
      } | null
      dragging: { id: string; position: { x: number; y: number } }[]
      sequence?: number | undefined
    }>,
    force?: boolean,
  ) => void
  requirementId: string | null
  navigateBoard: (id: string) => void
  setSidebarOpen: (
    value:
      | import('../types/studioState.ts').StudioState['sidebarOpen']
      | ((
          current: import('../types/studioState.ts').StudioState['sidebarOpen'],
        ) => import('../types/studioState.ts').StudioState['sidebarOpen']),
  ) => void
  mobileMenuToggle: import('react').RefObject<HTMLButtonElement | null>
}
