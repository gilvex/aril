export type StudioCanvasHandlersProps = {
  setBoardName: (
    value:
      | import('../types/studioState.ts').StudioState['boardName']
      | ((
          current: import('../types/studioState.ts').StudioState['boardName'],
        ) => import('../types/studioState.ts').StudioState['boardName']),
  ) => void
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
  change: (
    update: (
      value: import('@pomegranate/domain/workspace').Workspace,
    ) => import('@pomegranate/domain/workspace').Workspace,
    record?: boolean,
  ) => void
  board: import('@pomegranate/domain/workspace').Board
  setRequirementId: (
    value:
      | import('../types/studioState.ts').StudioState['requirementId']
      | ((
          current: import('../types/studioState.ts').StudioState['requirementId'],
        ) => import('../types/studioState.ts').StudioState['requirementId']),
  ) => void
  setView: (
    value:
      | import('../types/studioState.ts').StudioState['view']
      | ((
          current: import('../types/studioState.ts').StudioState['view'],
        ) => import('../types/studioState.ts').StudioState['view']),
  ) => void
}
