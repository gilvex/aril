import { type Node, type ReactFlowInstance } from '@xyflow/react'
export type UseBlueprintActionsProps = {
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: {
    id: string
    name: string
    description: string
    nodes: {
      id: string
      type: 'idea'
      position: { x: number; y: number }
      data: {
        title: string
        description: string
        kind: 'note' | 'layer' | 'service' | 'database' | 'instance' | 'person'
        status: 'Exploring' | 'Decided' | 'Question'
        notes: string
        requirements: string[]
      }
    }[]
    edges: {
      id: string
      source: string
      target: string
      type: 'smoothstep'
      label?: string | undefined
    }[]
    wireframe?:
      | {
          nodes: {
            id: string
            type: 'wireframe'
            position: { x: number; y: number }
            width: number
            height: number
            data: {
              kind:
                | 'button'
                | 'navigation'
                | 'screen'
                | 'text'
                | 'input'
                | 'card'
                | 'image'
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
      | undefined
    wireframeViewport?: { x: number; y: number; zoom: number } | undefined
    viewport?: { x: number; y: number; zoom: number } | undefined
  }
  setSelected: (id: string | null) => void
  setSelectedEdge: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['selectedEdge']),
  ) => void
  flow: ReactFlowInstance<
    Node<{
      title: string
      description: string
      kind: 'note' | 'layer' | 'service' | 'database' | 'instance' | 'person'
      status: 'Exploring' | 'Decided' | 'Question'
      notes: string
      requirements: string[]
    }>
  > | null
  setPalette: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['palette']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['palette'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['palette']),
  ) => void
  node:
    | {
        id: string
        type: 'idea'
        position: { x: number; y: number }
        data: {
          title: string
          description: string
          kind:
            'note' | 'layer' | 'service' | 'database' | 'instance' | 'person'
          status: 'Exploring' | 'Decided' | 'Question'
          notes: string
          requirements: string[]
        }
      }
    | undefined
}
