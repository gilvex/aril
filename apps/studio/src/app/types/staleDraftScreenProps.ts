import type { StudioSummary } from '@pomegranate/domain/studios'

export type StaleDraftScreenProps = {
  legacy: import('@pomegranate/domain/workspace').Workspace
  staleDraftKey: string | null
  setStaleDraftKey: (
    value:
      | import('../types').AppState['staleDraftKey']
      | ((
          current: import('../types').AppState['staleDraftKey'],
        ) => import('../types').AppState['staleDraftKey']),
  ) => void
  setRecovery: (
    value:
      | import('../types').AppState['recovery']
      | ((
          current: import('../types').AppState['recovery'],
        ) => import('../types').AppState['recovery']),
  ) => void
  setInitial: (
    value:
      | import('../types').AppState['initial']
      | ((
          current: import('../types').AppState['initial'],
        ) => import('../types').AppState['initial']),
  ) => void
  setLegacy: (
    value:
      | import('../types').AppState['legacy']
      | ((
          current: import('../types').AppState['legacy'],
        ) => import('../types').AppState['legacy']),
  ) => void
  studio: StudioSummary | null
  setError: (
    value:
      | import('../types').AppState['error']
      | ((
          current: import('../types').AppState['error'],
        ) => import('../types').AppState['error']),
  ) => void
}
