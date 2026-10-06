export type WireframeEdgeDetailsProps = {
  graph: import('@pomegranate/domain/wireframe').Wireframe
  edge: {
    id: string
    source: string
    target: string
    label: string
    type: 'smoothstep'
  }
  editField: import('react').RefObject<HTMLInputElement | null>
  save: (
    next: import('@pomegranate/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  focus: (id: string) => void
  setEdgeId: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['edgeId']),
  ) => void
}
