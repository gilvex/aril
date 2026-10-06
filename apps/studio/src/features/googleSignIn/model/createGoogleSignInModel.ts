import { configureStore } from '@reduxjs/toolkit'
import type { GoogleSignInState } from '../types/googleSignInState.ts'
import { selectGoogleSignIn } from './selectors/selectGoogleSignIn.ts'
import { googleSignInSlice } from './slices/googleSignInSlice.ts'

export function createGoogleSignInModel(initial: GoogleSignInState) {
  const store = configureStore({
    reducer: googleSignInSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectGoogleSignIn(store.getState())
  const actions = {
    setError: (
      value:
        | GoogleSignInState['error']
        | ((current: GoogleSignInState['error']) => GoogleSignInState['error']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().error) : value
      store.dispatch(googleSignInSlice.actions.setError(next))
    },
    setStatus: (
      value:
        | GoogleSignInState['status']
        | ((
            current: GoogleSignInState['status'],
          ) => GoogleSignInState['status']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().status) : value
      store.dispatch(googleSignInSlice.actions.setStatus(next))
    },
    setRetry: (
      value:
        | GoogleSignInState['retry']
        | ((current: GoogleSignInState['retry']) => GoogleSignInState['retry']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().retry) : value
      store.dispatch(googleSignInSlice.actions.setRetry(next))
    },
  }
  return { store, getSnapshot, actions }
}
