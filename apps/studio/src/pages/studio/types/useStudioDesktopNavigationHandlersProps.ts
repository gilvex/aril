export type StudioDesktopNavigationHandlersProps = {
  actionsMenu: import('react').RefObject<HTMLDetailsElement | null>
  setCollaborationPanel: (
    value:
      | import('../types/studioState.ts').StudioState['collaborationPanel']
      | ((
          current: import('../types/studioState.ts').StudioState['collaborationPanel'],
        ) => import('../types/studioState.ts').StudioState['collaborationPanel']),
  ) => void
}
