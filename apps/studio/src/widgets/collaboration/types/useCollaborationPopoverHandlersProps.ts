export type CollaborationPopoverHandlersProps = {
  setPanel: (panel: import('../types/collaborationBarPanel.ts').Panel) => void
  opener: import('react').RefObject<HTMLElement | null>
  setBusy: (
    value:
      | import('../types/collaborationBarState.ts').CollaborationBarState['busy']
      | ((
          current: import('../types/collaborationBarState.ts').CollaborationBarState['busy'],
        ) => import('../types/collaborationBarState.ts').CollaborationBarState['busy']),
  ) => void
  workspaceId: string
  setInvite: (
    value:
      | import('../types/collaborationBarState.ts').CollaborationBarState['invite']
      | ((
          current: import('../types/collaborationBarState.ts').CollaborationBarState['invite'],
        ) => import('../types/collaborationBarState.ts').CollaborationBarState['invite']),
  ) => void
  setCopied: (
    value:
      | import('../types/collaborationBarState.ts').CollaborationBarState['copied']
      | ((
          current: import('../types/collaborationBarState.ts').CollaborationBarState['copied'],
        ) => import('../types/collaborationBarState.ts').CollaborationBarState['copied']),
  ) => void
  setError: (
    value:
      | import('../types/collaborationBarState.ts').CollaborationBarState['error']
      | ((
          current: import('../types/collaborationBarState.ts').CollaborationBarState['error'],
        ) => import('../types/collaborationBarState.ts').CollaborationBarState['error']),
  ) => void
  invite: string
}
