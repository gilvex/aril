export type WireframeEdgeDetailsHandlersProps = {
  save: (
    next: import('@pomegranate/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  graph: import('@pomegranate/domain/wireframe').Wireframe
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
