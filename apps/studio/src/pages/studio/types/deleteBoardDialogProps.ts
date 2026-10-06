export type DeleteBoardDialogProps = {
  board: import('@pomegranate/domain/workspace').Board
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
      value: import('@pomegranate/domain/workspace').Workspace,
    ) => import('@pomegranate/domain/workspace').Workspace,
    record?: boolean,
  ) => void
}
