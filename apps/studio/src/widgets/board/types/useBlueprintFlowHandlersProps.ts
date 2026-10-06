export type BlueprintFlowHandlersProps = {
  liveNodes: import('@pomegranate/domain/workspace').Idea[]
  dimensions: Record<string, { width: number; height: number }>
  selectedIds: Set<string>
  board: import('@pomegranate/domain/workspace').Board
  selectedEdge: string | null
  profile: import('@pomegranate/domain/collaboration').Profile
  peers: import('@pomegranate/domain/collaboration').Presence[]
  flow:
    | import('@xyflow/react').ReactFlowInstance<
        import('@xyflow/react').Node<{
          title: string
          description: string
          kind:
            'layer' | 'service' | 'database' | 'instance' | 'person' | 'note'
          status: 'Exploring' | 'Decided' | 'Question'
          notes: string
          requirements: string[]
        }>
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
  following: import('@pomegranate/domain/collaboration').Presence | null
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
}
