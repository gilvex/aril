export type UseCollaborationControllerProps = {
  profile: import('@aril/domain/collaboration').Profile
  peers: import('@aril/domain/collaboration').Presence[]
  panel: import('../types/collaborationBarPanel.ts').Panel
  setPanel: (panel: import('../types/collaborationBarPanel.ts').Panel) => void
}
