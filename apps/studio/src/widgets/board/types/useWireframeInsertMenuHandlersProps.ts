export type WireframeInsertMenuHandlersProps = {
  add: (
    kind: import('@pomegranate/domain/wireframe').WireKind,
    at?: import('../types/canvasInsertPoint.ts').CanvasInsertPoint,
  ) => void
  insertPoint: import('../types/canvasInsertPoint.ts').CanvasInsertPoint
}
