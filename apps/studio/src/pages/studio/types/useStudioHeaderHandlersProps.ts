export type StudioHeaderHandlersProps = {
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
  onWorkspaces: (
    profile: import('@pomegranate/domain/collaboration').Profile,
  ) => void
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
        view: 'notes' | 'requirements' | 'design' | 'canvas' | 'wireframes'
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
  setNotice: (
    value:
      | import('../types/studioState.ts').StudioState['notice']
      | ((
          current: import('../types/studioState.ts').StudioState['notice'],
        ) => import('../types/studioState.ts').StudioState['notice']),
  ) => void
}
