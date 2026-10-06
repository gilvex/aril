import { configureStore } from '@reduxjs/toolkit'
import type { AccountConnectionState } from '../types/accountConnectionState.ts'
import { selectAccountConnection } from './selectors/selectAccountConnection.ts'
import { accountConnectionSlice } from './slices/accountConnectionSlice.ts'

export function createAccountConnectionModel(initial: AccountConnectionState) {
  const store = configureStore({
    reducer: accountConnectionSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectAccountConnection(store.getState())
  const actions = {
    setAccount: (
      value:
        | AccountConnectionState['account']
        | ((
            current: AccountConnectionState['account'],
          ) => AccountConnectionState['account']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().account) : value
      store.dispatch(accountConnectionSlice.actions.setAccount(next))
    },
    setError: (
      value:
        | AccountConnectionState['error']
        | ((
            current: AccountConnectionState['error'],
          ) => AccountConnectionState['error']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().error) : value
      store.dispatch(accountConnectionSlice.actions.setError(next))
    },
  }
  return { store, getSnapshot, actions }
}
