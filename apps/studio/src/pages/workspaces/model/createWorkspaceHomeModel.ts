import { configureStore } from '@reduxjs/toolkit'
import { runSaga } from 'redux-saga'
import type { WorkspaceHomeState } from '../types/workspaceHomeState.ts'
import { createWorkspace } from './iterators/createWorkspace.ts'
import { openHostedWorkspace } from './iterators/openHostedWorkspace.ts'
import { workspaceHomeSaga } from './saga/workspaceHomeSaga.ts'
import { selectWorkspaceHome } from './selectors/selectWorkspaceHome.ts'
import { workspaceHomeSlice } from './slices/workspaceHomeSlice.ts'

export function createWorkspaceHomeModel(initial: WorkspaceHomeState) {
  const store = configureStore({
    reducer: workspaceHomeSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectWorkspaceHome(store.getState())
  const actions = {
    createWorkspace: (name: string) =>
      runSaga(
        { dispatch: store.dispatch, getState: store.getState },
        createWorkspace,
        name,
      ).toPromise(),
    openHostedWorkspace: () => {
      void runSaga(
        { dispatch: store.dispatch, getState: store.getState },
        openHostedWorkspace,
      ).toPromise()
    },

    setStudios: (
      value:
        | WorkspaceHomeState['studios']
        | ((
            current: WorkspaceHomeState['studios'],
          ) => WorkspaceHomeState['studios']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().studios) : value
      store.dispatch(workspaceHomeSlice.actions.setStudios(next))
    },
    setName: (
      value:
        | WorkspaceHomeState['name']
        | ((current: WorkspaceHomeState['name']) => WorkspaceHomeState['name']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().name) : value
      store.dispatch(workspaceHomeSlice.actions.setName(next))
    },
    setCreating: (
      value:
        | WorkspaceHomeState['creating']
        | ((
            current: WorkspaceHomeState['creating'],
          ) => WorkspaceHomeState['creating']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().creating) : value
      store.dispatch(workspaceHomeSlice.actions.setCreating(next))
    },
    setBusy: (
      value:
        | WorkspaceHomeState['busy']
        | ((current: WorkspaceHomeState['busy']) => WorkspaceHomeState['busy']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().busy) : value
      store.dispatch(workspaceHomeSlice.actions.setBusy(next))
    },
    setError: (
      value:
        | WorkspaceHomeState['error']
        | ((
            current: WorkspaceHomeState['error'],
          ) => WorkspaceHomeState['error']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().error) : value
      store.dispatch(workspaceHomeSlice.actions.setError(next))
    },
    setHostedOrigin: (
      value:
        | WorkspaceHomeState['hostedOrigin']
        | ((
            current: WorkspaceHomeState['hostedOrigin'],
          ) => WorkspaceHomeState['hostedOrigin']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().hostedOrigin) : value
      store.dispatch(workspaceHomeSlice.actions.setHostedOrigin(next))
    },
  }
  return {
    store,
    getSnapshot,
    actions,
    start: () => {
      const task = runSaga(
        { dispatch: store.dispatch, getState: store.getState },
        workspaceHomeSaga,
      )
      return () => task.cancel()
    },
  }
}
