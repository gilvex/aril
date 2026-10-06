export type WireframeInsertMenuProps = {
  insertPoint: import('../types/canvasInsertPoint.ts').CanvasInsertPoint
  graph: import('@pomegranate/domain/wireframe').Wireframe
  setInsertPoint: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint']),
  ) => void
  add: (
    kind: import('@pomegranate/domain/wireframe').WireKind,
    at?: import('../types/canvasInsertPoint.ts').CanvasInsertPoint,
  ) => void
}
