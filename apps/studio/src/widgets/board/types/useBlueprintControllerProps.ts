import type { DragPosition } from '@aril/domain/collaboration'
export type UseBlueprintControllerProps = {
  board: import('@aril/domain/workspace').Board
  peers: import('@aril/domain/collaboration').Presence[]
  saveState: 'error' | 'saved' | 'pending' | 'saving'
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
  full: import('../../../features/canvasFullscreen/index.ts').CanvasFullscreenControls
  following: import('@aril/domain/collaboration').Presence | null
  update: (
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
}
