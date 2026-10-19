export type BlueprintFlowHandlersProps = {
  liveNodes: import('@aril/domain/workspace').Idea[]
  dimensions: Record<string, { width: number; height: number }>
  selectedIds: Set<string>
  board: import('@aril/domain/workspace').Board
  selectedEdge: string | null
  profile: import('@aril/domain/collaboration').Profile
  peers: import('@aril/domain/collaboration').Presence[]
  flow:
    | import('@xyflow/react').ReactFlowInstance<
        import('@xyflow/react').Node<
          import('@aril/domain/workspace').Idea['data']
        >
      >
    | null
  canvasRef: import('react').RefObject<HTMLDivElement | null>
  setPalette: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['palette']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['palette'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['palette']),
  ) => void
  setInsertPoint: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint']),
  ) => void
  compact: boolean
  touchSelection: boolean
  selectionBeforePointerDown: import('react').RefObject<Set<string>>
  setSelectedIds: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
  setSelectedEdge: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']),
  ) => void
  editItem: (id: string, connection?: boolean) => void
  setSelected: (id: string | null) => void
  checkpoint: () => void
  following: import('@aril/domain/collaboration').Presence | null
  update: (
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
}
