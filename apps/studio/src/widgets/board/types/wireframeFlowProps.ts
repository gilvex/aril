import type { WireFlowNode } from '@/widgets/board/types/wireFlowNode.ts'
import { type Wireframe, type WireNode } from '@aril/domain/wireframe'
import { type NodeChange, type ReactFlowInstance } from '@xyflow/react'
import type * as React from 'react'

export type WireframeFlowProps = {
  drawing?: import('react').ReactNode
  liveNodes: import('@aril/domain/wireframe').WireNode[]
  selection: Set<string>
  graph: import('@aril/domain/wireframe').Wireframe
  follow: (id: string) => void
  profile: import('@aril/domain/collaboration').Profile
  peers: import('@aril/domain/collaboration').Presence[]
  edgeId: string | null
  preview: boolean
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
    import('react').SetStateAction<ReactFlowInstance<WireFlowNode> | null>
  >
  publishCamera: (viewport: import('@xyflow/react').Viewport) => void
  openInsertMenu: (
    event: React.MouseEvent | MouseEvent,
    target?: Pick<WireNode, 'id' | 'data' | 'parentId'>,
  ) => void
  setInsertPoint: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint']),
  ) => void
  onNodesChange: (changes: NodeChange<WireFlowNode>[]) => void
  tool: import('../types/canvasTool.ts').CanvasTool
  compact: boolean
  touchSelection: boolean
  selectionBefore: import('react').RefObject<Set<string>>
  editItem: (id: string, connection?: boolean) => void
  setPalette: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['palette']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['palette'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['palette']),
  ) => void
  connect: (source: string, target: string, label?: string) => void
  checkpoint: () => void
  save: (next: Wireframe, record?: boolean) => void
  board: import('@aril/domain/workspace').Board
  following: import('@aril/domain/collaboration').Presence | null
  update: (
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
}
