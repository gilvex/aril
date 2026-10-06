import type { Idea } from '@pomegranate/domain/workspace'
export type BlueprintNodeDetailsHandlersProps = {
  updateNode: (data: Partial<Idea['data']>) => void
  node: import('@pomegranate/domain/workspace').Idea
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: import('@pomegranate/domain/workspace').Board
  setSelected: (id: string | null) => void
}
