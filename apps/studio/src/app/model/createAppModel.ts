import { configureStore } from '@reduxjs/toolkit'
import type { AppState } from '../types/appState.ts'
import { selectApp } from './selectors/selectApp.ts'
import { appSlice } from './slices/appSlice.ts'

export function createAppModel(initial: AppState) {
  const store = configureStore({
    reducer: appSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectApp(store.getState())
  const actions = {
    setRestoringRoute: (
      value:
        | AppState['restoringRoute']
        | ((current: AppState['restoringRoute']) => AppState['restoringRoute']),
    ) => {
      const next =
        typeof value === 'function'
          ? value(getSnapshot().restoringRoute)
          : value
      store.dispatch(appSlice.actions.setRestoringRoute(next))
    },
    setRouteNotice: (
      value:
        | AppState['routeNotice']
        | ((current: AppState['routeNotice']) => AppState['routeNotice']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().routeNotice) : value
      store.dispatch(appSlice.actions.setRouteNotice(next))
    },
    setProfile: (
      value:
        | AppState['profile']
        | ((current: AppState['profile']) => AppState['profile']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().profile) : value
      store.dispatch(appSlice.actions.setProfile(next))
    },
    setStudio: (
      value:
        | AppState['studio']
        | ((current: AppState['studio']) => AppState['studio']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().studio) : value
      store.dispatch(appSlice.actions.setStudio(next))
    },
    setInitial: (
      value:
        | AppState['initial']
        | ((current: AppState['initial']) => AppState['initial']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().initial) : value
      store.dispatch(appSlice.actions.setInitial(next))
    },
    setRecovery: (
      value:
        | AppState['recovery']
        | ((current: AppState['recovery']) => AppState['recovery']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().recovery) : value
      store.dispatch(appSlice.actions.setRecovery(next))
    },
    setLegacy: (
      value:
        | AppState['legacy']
        | ((current: AppState['legacy']) => AppState['legacy']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().legacy) : value
      store.dispatch(appSlice.actions.setLegacy(next))
    },
    setStaleDraftKey: (
      value:
        | AppState['staleDraftKey']
        | ((current: AppState['staleDraftKey']) => AppState['staleDraftKey']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().staleDraftKey) : value
      store.dispatch(appSlice.actions.setStaleDraftKey(next))
    },
    setInviteRequired: (
      value:
        | AppState['inviteRequired']
        | ((current: AppState['inviteRequired']) => AppState['inviteRequired']),
    ) => {
      const next =
        typeof value === 'function'
          ? value(getSnapshot().inviteRequired)
          : value
      store.dispatch(appSlice.actions.setInviteRequired(next))
    },
    setToken: (
      value:
        AppState['token'] | ((current: AppState['token']) => AppState['token']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().token) : value
      store.dispatch(appSlice.actions.setToken(next))
    },
    setName: (
      value:
        AppState['name'] | ((current: AppState['name']) => AppState['name']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().name) : value
      store.dispatch(appSlice.actions.setName(next))
    },
    setBusy: (
      value:
        AppState['busy'] | ((current: AppState['busy']) => AppState['busy']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().busy) : value
      store.dispatch(appSlice.actions.setBusy(next))
    },
    setError: (
      value:
        AppState['error'] | ((current: AppState['error']) => AppState['error']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().error) : value
      store.dispatch(appSlice.actions.setError(next))
    },
  }
  return { store, getSnapshot, actions }
}
