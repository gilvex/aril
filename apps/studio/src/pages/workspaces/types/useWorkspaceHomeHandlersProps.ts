export type WorkspaceHomeHandlersProps = {
  createWorkspace: ReturnType<
    typeof import('../model/useWorkspaceHomeModel.ts').useWorkspaceHomeModel
  >['createWorkspace']
  name: string
  onOpen: (studio: import('@aril/domain/studios').StudioSummary) => void
}
