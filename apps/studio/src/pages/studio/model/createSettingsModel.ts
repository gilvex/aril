import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { SettingsState } from '../types/settingsState.ts'
import { settingsSlice } from './slices/settingsSlice.ts'
import { settingsSaga } from './saga/settingsSaga.ts'
export function createSettingsModel(
  workspaceId: string,
  role: StudioSummary['role'],
) {
  const saga = createSagaMiddleware()
  const store = configureStore({
    reducer: settingsSlice.reducer,
    preloadedState: { ...settingsSlice.getInitialState(), role },
    middleware: (defaults) => defaults({ thunk: false }).concat(saga),
    devTools: false,
  })
  return {
    store,
    start: () => {
      const task = saga.run(settingsSaga, workspaceId)
      return () => task.cancel()
    },
    set: (value: Partial<SettingsState>) => {
      store.dispatch(settingsSlice.actions.changed(value))
    },
    load: () => {
      store.dispatch(settingsSlice.actions.loadMembers())
    },
    changeMember: (id: string, role?: 'member' | 'viewer') => {
      store.dispatch(settingsSlice.actions.changeMember({ id, role }))
    },
  }
}
