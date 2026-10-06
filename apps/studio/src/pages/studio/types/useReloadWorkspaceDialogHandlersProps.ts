export type ReloadWorkspaceDialogHandlersProps = {
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
}
