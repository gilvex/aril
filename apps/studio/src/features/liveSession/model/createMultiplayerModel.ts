import { selectMultiplayer } from '@/features/liveSession/model/selectors/selectMultiplayer.ts'
import { multiplayerSlice } from '@/features/liveSession/model/slices/multiplayerSlice.ts'
import type { MultiplayerState } from '@/features/liveSession/types/multiplayerState.ts'
import { configureStore } from '@reduxjs/toolkit'

export function createMultiplayerModel(initial: MultiplayerState) {
  const store = configureStore({
    reducer: multiplayerSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectMultiplayer(store.getState())
  const actions = {
    setProfile: (
      value:
        | MultiplayerState['profile']
        | ((
            current: MultiplayerState['profile'],
          ) => MultiplayerState['profile']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().profile) : value
      store.dispatch(multiplayerSlice.actions.setProfile(next))
    },
    setPeers: (
      value:
        | MultiplayerState['peers']
        | ((current: MultiplayerState['peers']) => MultiplayerState['peers']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().peers) : value
      store.dispatch(multiplayerSlice.actions.setPeers(next))
    },
    setActivity: (
      value:
        | MultiplayerState['activity']
        | ((
            current: MultiplayerState['activity'],
          ) => MultiplayerState['activity']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().activity) : value
      store.dispatch(multiplayerSlice.actions.setActivity(next))
    },
    setConnected: (
      value:
        | MultiplayerState['connected']
        | ((
            current: MultiplayerState['connected'],
          ) => MultiplayerState['connected']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().connected) : value
      store.dispatch(multiplayerSlice.actions.setConnected(next))
    },
  }
  return { store, getSnapshot, actions }
}
