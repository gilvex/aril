export type BlueprintMultiSelectionHandlersProps = {
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
    nodes: import('@xyflow/react').Node[]
    edges: { id: string }[]
  }) => void
  selectedNodes: import('@pomegranate/domain/workspace').Idea[]
}
