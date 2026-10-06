import type { DragPosition } from '@pomegranate/domain/collaboration'
export type UseBlueprintControllerProps = {
  board: import('@pomegranate/domain/workspace').Board
  peers: import('@pomegranate/domain/collaboration').Presence[]
  saveState: 'error' | 'saved' | 'pending' | 'saving'
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
  full: import('../../../features/canvasFullscreen/index.ts').CanvasFullscreenControls
  following: import('@pomegranate/domain/collaboration').Presence | null
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
}
