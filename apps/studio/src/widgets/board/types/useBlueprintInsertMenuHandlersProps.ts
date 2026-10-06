export type BlueprintInsertMenuHandlersProps = {
  addNode: (
    kind: import('@pomegranate/domain/workspace').Idea['data']['kind'],
    at?: { x: number; y: number },
  ) => void
  insertPoint: import('../types/canvasInsertPoint.ts').CanvasInsertPoint
}
