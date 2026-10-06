export type BlueprintSurfaceProps = {
  surface: import('react').RefObject<HTMLDivElement | null>
  handlePointerMove: (
    event: import('react').PointerEvent<HTMLDivElement>,
  ) => void
  sendPresence: (
    changes: {
      camera?: import('@pomegranate/domain/collaboration').CameraPresence | null
      cursor?: { x: number; y: number } | null
      selected?: string[]
      selectedEdges?: string[]
      dragging?: import('@pomegranate/domain/collaboration').DragPosition[]
    },
    force?: boolean,
  ) => void
  navigation: import('react').ReactNode
  tool: import('../types/canvasTool.ts').CanvasTool
  setTool: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['tool']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['tool'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['tool']),
  ) => void
  touchSelection: boolean
  setTouchSelection: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['touchSelection']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['touchSelection'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['touchSelection']),
  ) => void
  inspectorToggle: import('react').RefObject<HTMLButtonElement | null>
  inspectorOpen: boolean
  setInspectorOpen: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['inspectorPreference']),
  ) => void
  fullscreenButtonRef: import('react').RefObject<HTMLButtonElement | null>
  fullscreen: boolean
  toggleFullscreen: () => Promise<void>
  setPalette: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['palette']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['palette'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['palette']),
  ) => void
  palette: boolean
  addNode: (
    kind: import('@pomegranate/domain/workspace').Idea['data']['kind'],
    at?: { x: number; y: number },
  ) => void
  board: import('@pomegranate/domain/workspace').Board
  compact: boolean
  liveNodes: import('@pomegranate/domain/workspace').Idea[]
  dimensions: Record<string, { width: number; height: number }>
  selectedIds: Set<string>
  selectedEdge: string | null
  profile: import('@pomegranate/domain/collaboration').Profile
  peers: import('@pomegranate/domain/collaboration').Presence[]
  setFlow: import('react').Dispatch<
    import('react').SetStateAction<
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
    >
  >
  publishCamera: (viewport: import('@xyflow/react').Viewport) => void
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
  setInsertPoint: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['insertPoint']),
  ) => void
  onNodesChange: (
    changes: import('@xyflow/react').NodeChange<
      import('@xyflow/react').Node<
        import('@pomegranate/domain/workspace').Idea['data']
      >
    >[],
  ) => void
  onDelete: ({
    nodes,
    edges,
  }: {
    nodes: import('@xyflow/react').Node[]
    edges: { id: string }[]
  }) => void
  onConnect: (connection: import('@xyflow/react').Connection) => void
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
  insertPoint: import('../types/canvasInsertPoint.ts').CanvasInsertPoint | null
}
