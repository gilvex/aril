export type BlueprintInsertMenuProps = {
  insertPoint: import('../types/canvasInsertPoint.ts').CanvasInsertPoint
  board: import('@pomegranate/domain/workspace').Board
  setInsertPoint: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint']),
  ) => void
  addNode: (
    kind: import('@pomegranate/domain/workspace').Idea['data']['kind'],
    at?: { x: number; y: number },
  ) => void
}
