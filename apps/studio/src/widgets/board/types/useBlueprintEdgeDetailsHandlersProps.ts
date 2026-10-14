export type BlueprintEdgeDetailsHandlersProps = {
  update: (
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: import('@aril/domain/workspace').Board
  edge: {
    id: string
    source: string
    target: string
    type: 'smoothstep'
    label?: string | undefined
  }
  setSelectedEdge: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']),
  ) => void
}
