import { configureStore } from '@reduxjs/toolkit'
import { runSaga } from 'redux-saga'
import type { InvitationState } from '../types/index.ts'
import { invitationSlice } from './slices/invitationSlice.ts'
import { submitInvitationRequest } from './iterators/submitInvitationRequest.ts'
export function createInvitationModel() {
  const store = configureStore({
    reducer: invitationSlice.reducer,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  return {
    store,
    set: (value: Partial<InvitationState>) => {
      store.dispatch(invitationSlice.actions.changed(value))
    },
    run: <T>(url: string, init?: RequestInit) =>
      runSaga(
        { dispatch: store.dispatch, getState: store.getState },
        submitInvitationRequest<T>,
        url,
        init,
      ).toPromise(),
  }
}
