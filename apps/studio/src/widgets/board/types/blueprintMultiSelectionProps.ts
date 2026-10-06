import { type Node } from '@xyflow/react'

export type BlueprintMultiSelectionProps = {
  selectedNodes: import('@pomegranate/domain/workspace').Idea[]
  checkpoint: () => void
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: import('@pomegranate/domain/workspace').Board
  selectedIds: Set<string>
  onDelete: ({
    nodes,
    edges,
  }: {
    nodes: Node[]
    edges: { id: string }[]
  }) => void
}
