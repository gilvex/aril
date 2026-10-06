export type ReloadWorkspaceDialogProps = {
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
  exportWorkspace: () => void
  state: ReturnType<typeof import('@/entities/workspace/index.ts').useWorkspace>
}
