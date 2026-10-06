import type { Profile } from '@pomegranate/domain/collaboration'

export type JoinStudioFormProps = {
  setBusy: (
    value:
      | import('../types/appState.ts').AppState['busy']
      | ((
          current: import('../types/appState.ts').AppState['busy'],
        ) => import('../types/appState.ts').AppState['busy']),
  ) => void
  setError: (
    value:
      | import('../types/appState.ts').AppState['error']
      | ((
          current: import('../types/appState.ts').AppState['error'],
        ) => import('../types/appState.ts').AppState['error']),
  ) => void
  token: string
  profile: Profile | null
  name: string
  setProfile: (
    value:
      | import('../types/appState.ts').AppState['profile']
      | ((
          current: import('../types/appState.ts').AppState['profile'],
        ) => import('../types/appState.ts').AppState['profile']),
  ) => void
  setInviteRequired: (
    value:
      | import('../types/appState.ts').AppState['inviteRequired']
      | ((
          current: import('../types/appState.ts').AppState['inviteRequired'],
        ) => import('../types/appState.ts').AppState['inviteRequired']),
  ) => void
  setToken: (
    value:
      | import('../types/appState.ts').AppState['token']
      | ((
          current: import('../types/appState.ts').AppState['token'],
        ) => import('../types/appState.ts').AppState['token']),
  ) => void
  setName: (
    value:
      | import('../types/appState.ts').AppState['name']
      | ((
          current: import('../types/appState.ts').AppState['name'],
        ) => import('../types/appState.ts').AppState['name']),
  ) => void
  busy: boolean
}
