export type UseStudioFollowingProps = {
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
          | 'wireframes'
          | 'design'
          | 'requirements'
          | 'design'
          | 'notes'
        cursor: { x: number; y: number } | null
        selected: string[]
        selectedEdges: string[]
        requirement: {
          id: string
          field:
            | 'title'
            | 'description'
            | 'acceptance'
            | 'priority'
            | 'status'
            | 'category'
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
  sendPresence: (
    changes: Partial<{
      camera: { x: number; y: number; zoom: number } | null
      following: string | null
      clientId: string
      boardId: string | null
      view:
        'canvas' | 'wireframes' | 'design' | 'requirements' | 'design' | 'notes'
      cursor: { x: number; y: number } | null
      selected: string[]
      selectedEdges: string[]
      requirement: {
        id: string
        field:
          | 'title'
          | 'description'
          | 'acceptance'
          | 'priority'
          | 'status'
          | 'category'
          | null
        typing: boolean
      } | null
      dragging: { id: string; position: { x: number; y: number } }[]
      sequence?: number | undefined
    }>,
    force?: boolean,
  ) => void
  setFollowId: (
    value:
      | import('../types/studioState.ts').StudioState['followId']
      | ((
          current: import('../types/studioState.ts').StudioState['followId'],
        ) => import('../types/studioState.ts').StudioState['followId']),
  ) => void
  setNotice: (
    value:
      | import('../types/studioState.ts').StudioState['notice']
      | ((
          current: import('../types/studioState.ts').StudioState['notice'],
        ) => import('../types/studioState.ts').StudioState['notice']),
  ) => void
  t: import('i18next').TFunction<'translation', undefined>
  workspace: {
    schemaVersion: 1
    boards: {
      id: string
      name: string
      description: string
      nodes: {
        id: string
        type: 'idea'
        position: { x: number; y: number }
        data: {
          title: string
          description: string
          kind:
            'layer' | 'service' | 'database' | 'instance' | 'person' | 'note'
          status: 'Exploring' | 'Decided' | 'Question'
          notes: string
          requirements: string[]
        }
      }[]
      edges: {
        id: string
        source: string
        target: string
        type: 'smoothstep'
        label?: string | undefined
      }[]
      wireframe?:
        | {
            nodes: {
              id: string
              type: 'wireframe'
              position: { x: number; y: number }
              width: number
              height: number
              data: {
                kind:
                  | 'input'
                  | 'screen'
                  | 'text'
                  | 'button'
                  | 'card'
                  | 'image'
                  | 'navigation'
                title: string
                content: string
                tone: 'plain' | 'soft' | 'accent'
              }
              parentId?: string | undefined
            }[]
            edges: {
              id: string
              source: string
              target: string
              label: string
              type: 'smoothstep'
            }[]
          }
        | undefined
      wireframeViewport?: { x: number; y: number; zoom: number } | undefined
      viewport?: { x: number; y: number; zoom: number } | undefined
    }[]
    requirements: {
      id: string
      title: string
      description: string
      category: 'Deployment' | 'Access' | 'Operations' | 'Experience'
      priority: 'Must have' | 'Should have' | 'Later'
      status: 'Captured' | 'Designing' | 'Ready'
      acceptance: string
    }[]
    notes: string
    design: {
      accent: string
      density: 'Comfortable' | 'Compact'
      direction: string
    }
  }
  setView: (
    value:
      | import('../types/studioState.ts').StudioState['view']
      | ((
          current: import('../types/studioState.ts').StudioState['view'],
        ) => import('../types/studioState.ts').StudioState['view']),
  ) => void
  setCanvasMode: (
    value:
      | import('../types/studioState.ts').StudioState['canvasMode']
      | ((
          current: import('../types/studioState.ts').StudioState['canvasMode'],
        ) => import('../types/studioState.ts').StudioState['canvasMode']),
  ) => void
  setBoardId: (
    value:
      | import('../types/studioState.ts').StudioState['boardId']
      | ((
          current: import('../types/studioState.ts').StudioState['boardId'],
        ) => import('../types/studioState.ts').StudioState['boardId']),
  ) => void
  setRequirementId: (
    value:
      | import('../types/studioState.ts').StudioState['requirementId']
      | ((
          current: import('../types/studioState.ts').StudioState['requirementId'],
        ) => import('../types/studioState.ts').StudioState['requirementId']),
  ) => void
}
