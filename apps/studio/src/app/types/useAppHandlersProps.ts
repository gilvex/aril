export type AppHandlersProps = {
  setInitial: (
    value:
      | import('../types/appState.ts').AppState['initial']
      | ((
          current: import('../types/appState.ts').AppState['initial'],
        ) => import('../types/appState.ts').AppState['initial']),
  ) => void
  setRecovery: (
    value:
      | import('../types/appState.ts').AppState['recovery']
      | ((
          current: import('../types/appState.ts').AppState['recovery'],
        ) => import('../types/appState.ts').AppState['recovery']),
  ) => void
  setError: (
    value:
      | import('../types/appState.ts').AppState['error']
      | ((
          current: import('../types/appState.ts').AppState['error'],
        ) => import('../types/appState.ts').AppState['error']),
  ) => void
  setRouteNotice: (
    value:
      | import('../types/appState.ts').AppState['routeNotice']
      | ((
          current: import('../types/appState.ts').AppState['routeNotice'],
        ) => import('../types/appState.ts').AppState['routeNotice']),
  ) => void
  setStudio: (
    value:
      | import('../types/appState.ts').AppState['studio']
      | ((
          current: import('../types/appState.ts').AppState['studio'],
        ) => import('../types/appState.ts').AppState['studio']),
  ) => void
  setProfile: (
    value:
      | import('../types/appState.ts').AppState['profile']
      | ((
          current: import('../types/appState.ts').AppState['profile'],
        ) => import('../types/appState.ts').AppState['profile']),
  ) => void
}
