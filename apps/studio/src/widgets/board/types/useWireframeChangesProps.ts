import type { DragPosition } from '@pomegranate/domain/collaboration'
import { type Wireframe } from '@pomegranate/domain/wireframe'
export type UseWireframeChangesProps = {
  setSelection: (
    value: Set<string> | ((current: Set<string>) => Set<string>),
  ) => void
  moving: Set<string>
  dragPositions: import('react').RefObject<Map<string, DragPosition>>
  setMoving: (
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
  save: (next: Wireframe, record?: boolean) => void
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
}
