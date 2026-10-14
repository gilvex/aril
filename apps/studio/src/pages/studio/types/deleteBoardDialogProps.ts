export type DeleteBoardDialogProps = {
  board: import('@aril/domain/workspace').Board
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
  change: (
    update: (
      value: import('@aril/domain/workspace').Workspace,
    ) => import('@aril/domain/workspace').Workspace,
    record?: boolean,
  ) => void
}
