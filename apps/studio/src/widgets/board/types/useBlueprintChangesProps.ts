import type { DragPosition } from '@pomegranate/domain/collaboration'
export type UseBlueprintChangesProps = {
  setSelectedIds: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
  setDimensions: (
    value:
      | import('../types/canvasBoardState.ts').CanvasBoardState['dimensions']
      | ((
          current: import('../types/canvasBoardState.ts').CanvasBoardState['dimensions'],
        ) => import('../types/canvasBoardState.ts').CanvasBoardState['dimensions']),
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
        kind: 'layer' | 'service' | 'database' | 'instance' | 'person' | 'note'
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
      | undefined
    wireframeViewport?: { x: number; y: number; zoom: number } | undefined
    viewport?: { x: number; y: number; zoom: number } | undefined
  }
  localDragging: Set<string>
  dragPositions: import('react').RefObject<Map<string, DragPosition>>
  setLocalDragging: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
  sendPresence: (
    changes: {
      camera?: import('@pomegranate/domain/collaboration').CameraPresence | null
      cursor?: { x: number; y: number } | null
      selected?: string[]
      selectedEdges?: string[]
      dragging?: DragPosition[]
    },
    force?: boolean,
  ) => void
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
}
