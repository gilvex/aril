export type CollaborationPopoverProps = {
  beforeLeave: () => Promise<boolean>
  panel: 'profile' | 'people' | 'activity'
  setPanel: (panel: import('../types/collaborationBarPanel.ts').Panel) => void
  opener: import('react').RefObject<HTMLElement | null>
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
  onProfile: (
    profile: import('@pomegranate/domain/collaboration').Profile,
  ) => void
  profile: import('@pomegranate/domain/collaboration').Profile
  name: string
  setAvatar: (
    value:
      | import('../types/collaborationBarState.ts').CollaborationBarState['avatar']
      | ((
          current: import('../types/collaborationBarState.ts').CollaborationBarState['avatar'],
        ) => import('../types/collaborationBarState.ts').CollaborationBarState['avatar']),
  ) => void
  avatar: string
  setName: (
    value:
      | import('../types/collaborationBarState.ts').CollaborationBarState['name']
      | ((
          current: import('../types/collaborationBarState.ts').CollaborationBarState['name'],
        ) => import('../types/collaborationBarState.ts').CollaborationBarState['name']),
  ) => void
  busy: boolean
  peers: import('@pomegranate/domain/collaboration').Presence[]
  connected: boolean
  followId: string | null
  onFollow: (id: string | null) => void
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
  invite: string
  copied: boolean
  activity: import('@pomegranate/domain/collaboration').Activity[]
  error: string
}
