export type WorkspaceHomeHandlersProps = {
  createWorkspace: ReturnType<
    typeof import('../model/useWorkspaceHomeModel.ts').useWorkspaceHomeModel
  >['createWorkspace']
  name: string
  onOpen: (studio: import('@pomegranate/domain/studios').StudioSummary) => void
}
