export type BlueprintMultiSelectionHandlersProps = {
  checkpoint: () => void
  update: (
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
  board: import('@aril/domain/workspace').Board
  selectedIds: Set<string>
  onDelete: ({
    nodes,
    edges,
  }: {
    nodes: import('@xyflow/react').Node[]
    edges: { id: string }[]
  }) => void
  selectedNodes: import('@aril/domain/workspace').Idea[]
}
