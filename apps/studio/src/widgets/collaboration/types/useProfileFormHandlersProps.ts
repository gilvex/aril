import type { Profile } from '@pomegranate/domain/collaboration'
export type ProfileFormHandlersProps = {
  setBusy: (
    value:
      | import('../types/collaborationBarState.ts').CollaborationBarState['busy']
      | ((
          current: import('../types/collaborationBarState.ts').CollaborationBarState['busy'],
        ) => import('../types/collaborationBarState.ts').CollaborationBarState['busy']),
  ) => void
  setError: (
    value:
      | import('../types/collaborationBarState.ts').CollaborationBarState['error']
      | ((
          current: import('../types/collaborationBarState.ts').CollaborationBarState['error'],
        ) => import('../types/collaborationBarState.ts').CollaborationBarState['error']),
  ) => void
  name: string
  avatar: string
  onProfile: (profile: Profile) => void
  setPanel: (panel: import('../types/collaborationBarPanel.ts').Panel) => void
  opener: import('react').RefObject<HTMLElement | null>
  setAvatar: (
    value:
      | import('../types/collaborationBarState.ts').CollaborationBarState['avatar']
      | ((
          current: import('../types/collaborationBarState.ts').CollaborationBarState['avatar'],
        ) => import('../types/collaborationBarState.ts').CollaborationBarState['avatar']),
  ) => void
}
