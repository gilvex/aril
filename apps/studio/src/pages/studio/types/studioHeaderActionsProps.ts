export type StudioHeaderActionsProps = {
  full: {
    element: import('react').RefObject<HTMLDivElement | null>
    button: import('react').RefObject<HTMLButtonElement | null>
    fullscreen: boolean
    toggle: () => Promise<void>
  }
  view: import('../../../shared/types/studioView.ts').StudioView
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
  collaborationPanel: 'profile' | 'activity' | 'people' | null
  setCollaborationPanel: (
    value:
      | import('../types/studioState.ts').StudioState['collaborationPanel']
      | ((
          current: import('../types/studioState.ts').StudioState['collaborationPanel'],
        ) => import('../types/studioState.ts').StudioState['collaborationPanel']),
  ) => void
  studio: import('@pomegranate/domain/studios').StudioSummary
  multiplayer: {
    profile: import('@pomegranate/domain/collaboration').Profile
    setProfile: (
      value:
        | import('../../../features/liveSession/types/multiplayerState.ts').MultiplayerState['profile']
        | ((
            current: import('../../../features/liveSession/types/multiplayerState.ts').MultiplayerState['profile'],
          ) => import('../../../features/liveSession/types/multiplayerState.ts').MultiplayerState['profile']),
    ) => void
    peers: import('@pomegranate/domain/collaboration').Presence[]
    activity: import('@pomegranate/domain/collaboration').Activity[]
    connected: boolean
    clientId: `${string}-${string}-${string}-${string}-${string}`
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
  }
  followId: string | null
  setFollowId: (
    value:
      | import('../types/studioState.ts').StudioState['followId']
      | ((
          current: import('../types/studioState.ts').StudioState['followId'],
        ) => import('../types/studioState.ts').StudioState['followId']),
  ) => void
}
