export type WireframeInsertMenuHandlersProps = {
  add: (
    kind: import('@aril/domain/wireframe').WireKind,
    at?: import('../types/canvasInsertPoint.ts').CanvasInsertPoint,
  ) => void
  insertPoint: import('../types/canvasInsertPoint.ts').CanvasInsertPoint
}
