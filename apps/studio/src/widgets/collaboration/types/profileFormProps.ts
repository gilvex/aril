import type { Profile } from '@pomegranate/domain/collaboration'

export type ProfileFormProps = {
  setBusy: (
    value:
      | import('../types').CollaborationBarState['busy']
      | ((
          current: import('../types').CollaborationBarState['busy'],
        ) => import('../types').CollaborationBarState['busy']),
  ) => void
  setError: (
    value:
      | import('../types').CollaborationBarState['error']
      | ((
          current: import('../types').CollaborationBarState['error'],
        ) => import('../types').CollaborationBarState['error']),
  ) => void
  onProfile: (profile: Profile) => void
  setPanel: (panel: import('../types').Panel) => void
  opener: import('react').RefObject<HTMLElement | null>
  profile: Profile
  name: string
  setAvatar: (
    value:
      | import('../types').CollaborationBarState['avatar']
      | ((
          current: import('../types').CollaborationBarState['avatar'],
        ) => import('../types').CollaborationBarState['avatar']),
  ) => void
  avatar: string
  setName: (
    value:
      | import('../types').CollaborationBarState['name']
      | ((
          current: import('../types').CollaborationBarState['name'],
        ) => import('../types').CollaborationBarState['name']),
  ) => void
  busy: boolean
}
