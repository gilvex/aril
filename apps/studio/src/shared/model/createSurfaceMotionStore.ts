import { configureStore } from '@reduxjs/toolkit'
import { surfaceMotionSlice } from './slices/surfaceMotionSlice.ts'
export function createSurfaceMotionStore() {
  return configureStore({
    reducer: surfaceMotionSlice.reducer,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
}
