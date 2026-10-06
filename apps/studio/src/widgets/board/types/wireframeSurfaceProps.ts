import type * as React from 'react'

export type WireframeSurfaceProps = {
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
      | import('../types/wireframeBoardState.ts').WireframeBoardState['tool']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['tool'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['tool']),
  ) => void
  touchSelection: boolean
  setTouchSelection: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['touchSelection']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['touchSelection'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['touchSelection']),
  ) => void
  preview: boolean
  inspectorToggle: import('react').RefObject<HTMLButtonElement | null>
  inspectorOpen: boolean
  setInspectorOpen: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['inspectorPreference']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['inspectorPreference'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['inspectorPreference']),
  ) => void
  full: import('../../../features/canvasFullscreen/index.ts').CanvasFullscreenControls
  setPreview: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['preview']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['preview'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['preview']),
  ) => void
  setPalette: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['palette']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['palette'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['palette']),
  ) => void
  palette: boolean
  graph: import('@pomegranate/domain/wireframe').Wireframe
  add: (
    kind: import('@pomegranate/domain/wireframe').WireKind,
    at?: import('../types/canvasInsertPoint.ts').CanvasInsertPoint,
  ) => void
  screens: import('@pomegranate/domain/wireframe').WireNode[]
  compact: boolean
  liveNodes: import('@pomegranate/domain/wireframe').WireNode[]
  selection: Set<string>
  follow: (id: string) => void
  profile: import('@pomegranate/domain/collaboration').Profile
  peers: import('@pomegranate/domain/collaboration').Presence[]
  edgeId: string | null
  routes: Map<string, import('../types/wireRoute.ts').WireRoute>
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
  setFlow: import('react').Dispatch<
    import('react').SetStateAction<
      | import('@xyflow/react').ReactFlowInstance<
          import('../types/wireFlowNode.ts').WireFlowNode
        >
      | null
    >
  >
  publishCamera: (viewport: import('@xyflow/react').Viewport) => void
  openInsertMenu: (
    event: React.MouseEvent | MouseEvent,
    target?: Pick<
      import('@pomegranate/domain/wireframe').WireNode,
      'id' | 'data' | 'parentId'
    >,
  ) => void
  setInsertPoint: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint']),
  ) => void
  onNodesChange: (
    changes: import('@xyflow/react').NodeChange<
      import('../types/wireFlowNode.ts').WireFlowNode
    >[],
  ) => void
  selectionBefore: import('react').RefObject<Set<string>>
  editItem: (id: string, connection?: boolean) => void
  connect: (source: string, target: string, label?: string) => void
  checkpoint: () => void
  save: (
    next: import('@pomegranate/domain/wireframe').Wireframe,
    record?: boolean,
  ) => void
  board: import('@pomegranate/domain/workspace').Board
  following: import('@pomegranate/domain/collaboration').Presence | null
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
  insertPoint: import('../types/canvasInsertPoint.ts').CanvasInsertPoint | null
  starter: () => void
  previewMessage: string
}
