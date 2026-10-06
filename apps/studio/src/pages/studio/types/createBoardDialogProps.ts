export type CreateBoardDialogProps = {
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
  change: (
    update: (
      value: import('@pomegranate/domain/workspace').Workspace,
    ) => import('@pomegranate/domain/workspace').Workspace,
    record?: boolean,
  ) => void
  boardName: string
  setBoardId: (
    value:
      | import('../types/studioState.ts').StudioState['boardId']
      | ((
          current: import('../types/studioState.ts').StudioState['boardId'],
        ) => import('../types/studioState.ts').StudioState['boardId']),
  ) => void
  setView: (
    value:
      | import('../types/studioState.ts').StudioState['view']
      | ((
          current: import('../types/studioState.ts').StudioState['view'],
        ) => import('../types/studioState.ts').StudioState['view']),
  ) => void
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
  setBoardName: (
    value:
      | import('../types/studioState.ts').StudioState['boardName']
      | ((
          current: import('../types/studioState.ts').StudioState['boardName'],
        ) => import('../types/studioState.ts').StudioState['boardName']),
  ) => void
  workspace: import('@pomegranate/domain/workspace').Workspace
}
