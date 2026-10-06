export type WireframeFlowHandlersProps = {
  liveNodes: import('@pomegranate/domain/wireframe').WireNode[]
  selection: Set<string>
  preview: boolean
  checkpoint: () => void
  graph: import('@pomegranate/domain/wireframe').Wireframe
  follow: (id: string) => void
  profile: import('@pomegranate/domain/collaboration').Profile
  peers: import('@pomegranate/domain/collaboration').Presence[]
  edgeId: string | null
  routes: Map<string, import('../types/wireRoute.ts').WireRoute>
  setEdgeId: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']),
  ) => void
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
  compact: boolean
  touchSelection: boolean
  selectionBefore: import('react').RefObject<Set<string>>
  editItem: (id: string, connection?: boolean) => void
  setPalette: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['palette']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['palette'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['palette']),
  ) => void
  save: (
    next: import('@pomegranate/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
}
