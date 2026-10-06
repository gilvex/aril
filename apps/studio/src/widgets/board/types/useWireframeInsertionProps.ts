import type { WireFlowNode } from '@/widgets/board/types/wireFlowNode.ts'
import { type Wireframe } from '@pomegranate/domain/wireframe'
import { type ReactFlowInstance } from '@xyflow/react'
export type UseWireframeInsertionProps = {
  preview: boolean
  flow: ReactFlowInstance<WireFlowNode> | null
  surface: import('react').RefObject<HTMLDivElement | null>
  setPalette: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['palette']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['palette'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['palette']),
  ) => void
  setInsertPoint: (
    value:
      | import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint']
      | ((
          current: import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint'],
        ) => import('../types/wireframeBoardState.ts').WireframeBoardState['insertPoint']),
  ) => void
  graph: {
    nodes: {
      id: string
      type: 'wireframe'
      position: { x: number; y: number }
      width: number
      height: number
      data: {
        kind:
          | 'screen'
          | 'text'
          | 'button'
          | 'input'
          | 'card'
          | 'image'
          | 'navigation'
        title: string
        content: string
        tone: 'plain' | 'soft' | 'accent'
      }
      parentId?: string | undefined
    }[]
    edges: {
      id: string
      source: string
      target: string
      label: string
      type: 'smoothstep'
    }[]
  }
  node:
    | {
        id: string
        type: 'wireframe'
        position: { x: number; y: number }
        width: number
        height: number
        data: {
          kind:
            | 'screen'
            | 'text'
            | 'button'
            | 'input'
            | 'card'
            | 'image'
            | 'navigation'
          title: string
          content: string
          tone: 'plain' | 'soft' | 'accent'
        }
        parentId?: string | undefined
      }
    | undefined
  liveNodes: {
    id: string
    type: 'wireframe'
    position: { x: number; y: number }
    width: number
    height: number
    data: {
      kind:
        'screen' | 'text' | 'button' | 'input' | 'card' | 'image' | 'navigation'
      title: string
      content: string
      tone: 'plain' | 'soft' | 'accent'
    }
    parentId?: string | undefined
  }[]
  screens: {
    id: string
    type: 'wireframe'
    position: { x: number; y: number }
    width: number
    height: number
    data: {
      kind:
        'screen' | 'text' | 'button' | 'input' | 'card' | 'image' | 'navigation'
      title: string
      content: string
      tone: 'plain' | 'soft' | 'accent'
    }
    parentId?: string | undefined
  }[]
  pendingFocus: import('react').RefObject<string | null>
  save: (next: Wireframe, record?: boolean) => void
  select: (id: string) => void
}
