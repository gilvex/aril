export type BlueprintOverviewProps = {
  requirements: import('@aril/domain/workspace').Requirement[]
  openRequirement: (id: string) => void
  focusNode: (id: string) => void
  fitBoard: () => void
  addNode: (kind: import('@aril/domain/workspace').Idea['data']['kind']) => void
  board: import('@aril/domain/workspace').Board
  update: (
    board: import('@aril/domain/workspace').Board,
    record?: boolean,
  ) => void
}
