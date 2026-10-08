import type { Board, Requirement } from '@pomegranate/domain/workspace'
export type BoardScopeProps = {
  board: Board
  requirements: Requirement[]
  openRequirement: (id: string) => void
}
