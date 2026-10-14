import type { Board, Requirement } from '@aril/domain/workspace'
export type BoardScopeProps = {
  board: Board
  requirements: Requirement[]
  openRequirement: (id: string) => void
}
