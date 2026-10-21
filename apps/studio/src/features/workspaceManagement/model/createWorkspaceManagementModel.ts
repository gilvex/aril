import { configureStore } from '@reduxjs/toolkit'
import { runSaga } from 'redux-saga'
import type { WorkspaceManagementState } from '../types/workspaceManagementState.ts'
import { workspaceManagementSlice } from './slices/workspaceManagementSlice.ts'
import { saveWorkspaceManagement } from './iterators/saveWorkspaceManagement.ts'
export function createWorkspaceManagementModel() {
  const store = configureStore({
    reducer: workspaceManagementSlice.reducer,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  return {
    store,
    set: (value: Partial<WorkspaceManagementState>) =>
      store.dispatch(workspaceManagementSlice.actions.changed(value)),
    save: (beforeSave: () => Promise<boolean>) =>
      runSaga(
        { dispatch: store.dispatch, getState: store.getState },
        saveWorkspaceManagement,
        beforeSave,
      ).toPromise(),
  }
}
