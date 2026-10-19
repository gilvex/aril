import type { Board } from '@aril/domain/workspace'
import type { RefObject } from 'react'
export type CanvasClipboardProps = {
  checkpoint: () => void
  board: Board
  selectedIds: Set<string>
  canvasRef: RefObject<HTMLDivElement | null>
  update: (board: Board) => void
  setSelectedIds: (ids: Set<string>) => void
}
