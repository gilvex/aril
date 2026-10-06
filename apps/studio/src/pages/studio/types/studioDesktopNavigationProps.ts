export type StudioDesktopNavigationProps = {
  view: import('../../../shared/types/studioView.ts').StudioView
  setView: (
    value:
      | import('../types/studioState.ts').StudioState['view']
      | ((
          current: import('../types/studioState.ts').StudioState['view'],
        ) => import('../types/studioState.ts').StudioState['view']),
  ) => void
  setRequirementId: (
    value:
      | import('../types/studioState.ts').StudioState['requirementId']
      | ((
          current: import('../types/studioState.ts').StudioState['requirementId'],
        ) => import('../types/studioState.ts').StudioState['requirementId']),
  ) => void
  present: Pick<
    import('@pomegranate/domain/collaboration').Presence,
    'view' | 'boardId' | 'profile'
  >[]
  actionsMenu: import('react').RefObject<HTMLDetailsElement | null>
  setCollaborationPanel: (
    value:
      | import('../types/studioState.ts').StudioState['collaborationPanel']
      | ((
          current: import('../types/studioState.ts').StudioState['collaborationPanel'],
        ) => import('../types/studioState.ts').StudioState['collaborationPanel']),
  ) => void
  setModal: (
    value:
      | import('../types/studioState.ts').StudioState['modal']
      | ((
          current: import('../types/studioState.ts').StudioState['modal'],
        ) => import('../types/studioState.ts').StudioState['modal']),
  ) => void
  loadHistory: () => Promise<void>
  importRef: import('react').RefObject<HTMLInputElement | null>
  exportWorkspace: () => void
}
