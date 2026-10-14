import type { Idea } from '@aril/domain/workspace'
export type BlueprintNodeDetailsHandlersProps = {
  updateNode: (data: Partial<Idea['data']>) => void
  node: import('@aril/domain/workspace').Idea
  update: (
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: import('@aril/domain/workspace').Board
  setSelected: (id: string | null) => void
}
