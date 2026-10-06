export type WireframeOverviewProps = {
  graph: import('@pomegranate/domain/wireframe').Wireframe
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
  add: (
    kind: import('@pomegranate/domain/wireframe').WireKind,
    at?: import('../types/canvasInsertPoint.ts').CanvasInsertPoint,
  ) => void
  screens: import('@pomegranate/domain/wireframe').WireNode[]
  focus: (id: string) => void
}
