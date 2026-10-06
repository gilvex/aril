import { selectAccountConnection } from '@/widgets/collaboration/model/selectors/selectAccountConnection.ts'
import { accountConnectionSlice } from '@/widgets/collaboration/model/slices/accountConnectionSlice.ts'
import type { AccountConnectionState } from '@/widgets/collaboration/types/accountConnectionState.ts'
import { configureStore } from '@reduxjs/toolkit'

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
