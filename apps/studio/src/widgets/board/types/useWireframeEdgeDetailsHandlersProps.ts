export type WireframeEdgeDetailsHandlersProps = {
  save: (
    next: import('@aril/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  graph: import('@aril/domain/wireframe').Wireframe
  edge: {
    id: string
    source: string
    target: string
    label: string
    type: 'smoothstep'
  }
  setEdgeId: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']),
  ) => void
}
