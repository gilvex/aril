export type UseStudioWorkspaceActionsProps = {
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
  setSidebarOpen: (
    value:
      | import('../types/studioState.ts').StudioState['sidebarOpen']
      | ((
          current: import('../types/studioState.ts').StudioState['sidebarOpen'],
        ) => import('../types/studioState.ts').StudioState['sidebarOpen']),
  ) => void
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
  workspace: import('@pomegranate/domain/workspace').Workspace
  setHistoryLoading: (
    value:
      | import('../types/studioState.ts').StudioState['historyLoading']
      | ((
          current: import('../types/studioState.ts').StudioState['historyLoading'],
        ) => import('../types/studioState.ts').StudioState['historyLoading']),
  ) => void
  setSnapshots: (
    value:
      | import('../types/studioState.ts').StudioState['snapshots']
      | ((
          current: import('../types/studioState.ts').StudioState['snapshots'],
        ) => import('../types/studioState.ts').StudioState['snapshots']),
  ) => void
  studio: import('@pomegranate/domain/studios').StudioSummary
  setNotice: (
    value:
      | import('../types/studioState.ts').StudioState['notice']
      | ((
          current: import('../types/studioState.ts').StudioState['notice'],
        ) => import('../types/studioState.ts').StudioState['notice']),
  ) => void
}
