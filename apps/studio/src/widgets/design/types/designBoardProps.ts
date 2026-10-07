import type { Workspace } from '@pomegranate/domain/workspace'
import type {
  Presence,
  CameraPresence,
  DragPosition,
} from '@pomegranate/domain/collaboration'
export type DesignBoardProps = {
  workspaceId: string
  saveState: 'saved' | 'pending' | 'saving' | 'error'
  design: Workspace['design']
  update: (design: Workspace['design']) => void
  peers: Presence[]
  following: Presence | null
  sendPresence: (
    changes: {
      designPageId?: string | null
      cursor?: { x: number; y: number } | null
      camera?: CameraPresence | null
      selected?: string[]
      dragging?: DragPosition[]
    },
    force?: boolean,
  ) => void
}
