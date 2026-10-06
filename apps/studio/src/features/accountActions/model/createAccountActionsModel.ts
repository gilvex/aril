import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import { accountActionsSlice } from './slices/accountActionsSlice.ts'
import { accountActionsSaga } from './saga/accountActionsSaga.ts'

export function createAccountActionsModel(beforeLeave: () => Promise<boolean>) {
  const saga = createSagaMiddleware()
  const store = configureStore({
    reducer: accountActionsSlice.reducer,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }).concat(saga),
  })
  return { store, start: () => saga.run(accountActionsSaga, beforeLeave) }
}
