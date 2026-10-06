export type StudioContentHandlersProps = {
  setNotice: (
    value:
      | import('../types/studioState.ts').StudioState['notice']
      | ((
          current: import('../types/studioState.ts').StudioState['notice'],
        ) => import('../types/studioState.ts').StudioState['notice']),
  ) => void
  setPendingImport: (
    value:
      | import('../types/studioState.ts').StudioState['pendingImport']
      | ((
          current: import('../types/studioState.ts').StudioState['pendingImport'],
        ) => import('../types/studioState.ts').StudioState['pendingImport']),
  ) => void
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
}
