import type { DragPosition } from '@aril/domain/collaboration'
export type UseWireframeControllerProps = {
  board: import('@aril/domain/workspace').Board
  following: import('@aril/domain/collaboration').Presence | null
  sendPresence: (
    changes: {
      camera?: import('@aril/domain/collaboration').CameraPresence | null
      cursor?: { x: number; y: number } | null
      selected?: string[]
      selectedEdges?: string[]
      dragging?: DragPosition[]
    },
    force?: boolean,
  ) => void
  peers: import('@aril/domain/collaboration').Presence[]
  update: (
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
  saveState: 'error' | 'saved' | 'pending' | 'saving'
}
