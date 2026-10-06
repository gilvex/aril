export type BlueprintOverviewProps = {
  board: import('@pomegranate/domain/workspace').Board
  update: (
    board: import('@pomegranate/domain/workspace').Board,
    record?: boolean,
  ) => void
}
