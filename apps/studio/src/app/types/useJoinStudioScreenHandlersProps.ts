export type JoinStudioScreenHandlersProps = {
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
  setError: (
    value:
      | import('../types/appState.ts').AppState['error']
      | ((
          current: import('../types/appState.ts').AppState['error'],
        ) => import('../types/appState.ts').AppState['error']),
  ) => void
}
