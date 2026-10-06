import { configureStore } from '@reduxjs/toolkit'
import { guestLinksSlice } from './slices/guestLinksSlice.ts'
export function createGuestLinksModel() {
  return configureStore({ reducer: guestLinksSlice.reducer, devTools: false })
}
