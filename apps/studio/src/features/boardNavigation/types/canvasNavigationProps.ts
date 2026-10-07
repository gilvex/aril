import type { Presence } from '@pomegranate/domain/collaboration'
import type { Board } from '@pomegranate/domain/workspace'
export type CanvasNavigationProps = {
  board: Board
  boards: Board[]
  mode: 'canvas' | 'wireframes' | 'design'
  onBoard: (id: string) => void
  onMode: (mode: 'canvas' | 'wireframes' | 'design') => void
  onAdd: (mode: 'canvas' | 'wireframes' | 'design') => void
  onNew: () => void
  onDelete: () => void
  onRename: (name: string) => void
  present: Pick<Presence, 'profile' | 'view' | 'boardId'>[]
}
