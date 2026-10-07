import type { Board } from '@pomegranate/domain/workspace'
export function createCanvasNavigationState(board: Board) {
  const open: boolean = false
  const renaming: boolean = false
  const name: string = board.name
  return { open, renaming, name, query: '' }
}
