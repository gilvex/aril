export type StaleDraftScreenHandlersProps = {
  staleDraftKey: string | null
  setStaleDraftKey: (
    value:
      | import('../types/appState.ts').AppState['staleDraftKey']
      | ((
          current: import('../types/appState.ts').AppState['staleDraftKey'],
        ) => import('../types/appState.ts').AppState['staleDraftKey']),
  ) => void
  setRecovery: (
    value:
      | import('../types/appState.ts').AppState['recovery']
      | ((
          current: import('../types/appState.ts').AppState['recovery'],
        ) => import('../types/appState.ts').AppState['recovery']),
  ) => void
  setInitial: (
    value:
      | import('../types/appState.ts').AppState['initial']
      | ((
          current: import('../types/appState.ts').AppState['initial'],
        ) => import('../types/appState.ts').AppState['initial']),
  ) => void
  setLegacy: (
    value:
      | import('../types/appState.ts').AppState['legacy']
      | ((
          current: import('../types/appState.ts').AppState['legacy'],
        ) => import('../types/appState.ts').AppState['legacy']),
  ) => void
  studio: import('@pomegranate/domain/studios').StudioSummary | null
  setError: (
    value:
      | import('../types/appState.ts').AppState['error']
      | ((
          current: import('../types/appState.ts').AppState['error'],
        ) => import('../types/appState.ts').AppState['error']),
  ) => void
}
