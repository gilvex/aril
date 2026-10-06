import { configureStore } from '@reduxjs/toolkit'
import type { CollaborationBarState } from '../types/collaborationBarState.ts'
import { selectCollaborationBar } from './selectors/selectCollaborationBar.ts'
import { collaborationBarSlice } from './slices/collaborationBarSlice.ts'

export function createCollaborationBarModel(initial: CollaborationBarState) {
  const store = configureStore({
    reducer: collaborationBarSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectCollaborationBar(store.getState())
  const actions = {
    setName: (
      value:
        | CollaborationBarState['name']
        | ((
            current: CollaborationBarState['name'],
          ) => CollaborationBarState['name']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().name) : value
      store.dispatch(collaborationBarSlice.actions.setName(next))
    },
    setAvatar: (
      value:
        | CollaborationBarState['avatar']
        | ((
            current: CollaborationBarState['avatar'],
          ) => CollaborationBarState['avatar']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().avatar) : value
      store.dispatch(collaborationBarSlice.actions.setAvatar(next))
    },
    setBusy: (
      value:
        | CollaborationBarState['busy']
        | ((
            current: CollaborationBarState['busy'],
          ) => CollaborationBarState['busy']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().busy) : value
      store.dispatch(collaborationBarSlice.actions.setBusy(next))
    },
    setError: (
      value:
        | CollaborationBarState['error']
        | ((
            current: CollaborationBarState['error'],
          ) => CollaborationBarState['error']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().error) : value
      store.dispatch(collaborationBarSlice.actions.setError(next))
    },
    setInvite: (
      value:
        | CollaborationBarState['invite']
        | ((
            current: CollaborationBarState['invite'],
          ) => CollaborationBarState['invite']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().invite) : value
      store.dispatch(collaborationBarSlice.actions.setInvite(next))
    },
    setCopied: (
      value:
        | CollaborationBarState['copied']
        | ((
            current: CollaborationBarState['copied'],
          ) => CollaborationBarState['copied']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().copied) : value
      store.dispatch(collaborationBarSlice.actions.setCopied(next))
    },
  }
  return { store, getSnapshot, actions }
}
