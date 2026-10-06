export type UseCollaborationControllerProps = {
  profile: import('@pomegranate/domain/collaboration').Profile
  peers: import('@pomegranate/domain/collaboration').Presence[]
  panel: import('../types/collaborationBarPanel.ts').Panel
  setPanel: (panel: import('../types/collaborationBarPanel.ts').Panel) => void
}
