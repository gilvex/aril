import { configureStore } from '@reduxjs/toolkit'
import { federatedSignInSlice } from './slices/federatedSignInSlice.ts'

export function createFederatedSignInModel() {
  const store = configureStore({ reducer: federatedSignInSlice.reducer })
  return { store, actions: federatedSignInSlice.actions }
}
