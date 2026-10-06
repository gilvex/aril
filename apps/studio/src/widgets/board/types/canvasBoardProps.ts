import type { CanvasFullscreenControls } from '@/features/canvasFullscreen/index.ts'
import type {
  CameraPresence,
  DragPosition,
  Presence,
  Profile,
} from '@pomegranate/domain/collaboration'
import type { Board, Requirement } from '@pomegranate/domain/workspace'
import type { ReactNode } from 'react'

export type CanvasBoardProps = {
  full: CanvasFullscreenControls
  following: Presence | null
  navigation: ReactNode
  board: Board
  requirements: Requirement[]
  update: (board: Board, record?: boolean) => void
  checkpoint: () => void
  openRequirement: (id: string) => void
  peers: Presence[]
  profile: Profile
  saveState: 'saved' | 'pending' | 'saving' | 'error'
  sendPresence: (
    changes: {
      camera?: CameraPresence | null
      cursor?: { x: number; y: number } | null
      selected?: string[]
      selectedEdges?: string[]
      dragging?: DragPosition[]
    },
    force?: boolean,
  ) => void
}
