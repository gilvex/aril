export type BlueprintOverviewProps = {
  requirements: import('@pomegranate/domain/workspace').Requirement[]
  openRequirement: (id: string) => void
  focusNode: (id: string) => void
  fitBoard: () => void
  addNode: (
    kind: import('@pomegranate/domain/workspace').Idea['data']['kind'],
  ) => void
  board: import('@pomegranate/domain/workspace').Board
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
}
