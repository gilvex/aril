import type { DragPosition } from '@pomegranate/domain/collaboration'
export type UseWireframeControllerProps = {
  board: import('@pomegranate/domain/workspace').Board
  following: import('@pomegranate/domain/collaboration').Presence | null
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
  peers: import('@pomegranate/domain/collaboration').Presence[]
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
  saveState: 'error' | 'saved' | 'pending' | 'saving'
}
