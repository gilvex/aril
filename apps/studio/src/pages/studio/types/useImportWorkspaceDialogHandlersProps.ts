export type ImportWorkspaceDialogHandlersProps = {
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
  change: (
    update: (
      value: import('@pomegranate/domain/workspace').Workspace,
    ) => import('@pomegranate/domain/workspace').Workspace,
    record?: boolean,
  ) => void
  pendingImport: import('@pomegranate/domain/workspace').Workspace
  setBoardId: (
    value:
      | import('../types/studioState.ts').StudioState['boardId']
      | ((
          current: import('../types/studioState.ts').StudioState['boardId'],
        ) => import('../types/studioState.ts').StudioState['boardId']),
  ) => void
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
  setView: (
    value:
      | import('../types/studioState.ts').StudioState['view']
      | ((
          current: import('../types/studioState.ts').StudioState['view'],
        ) => import('../types/studioState.ts').StudioState['view']),
  ) => void
  setNotice: (
    value:
      | import('../types/studioState.ts').StudioState['notice']
      | ((
          current: import('../types/studioState.ts').StudioState['notice'],
        ) => import('../types/studioState.ts').StudioState['notice']),
  ) => void
}
