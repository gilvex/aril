import { configureStore } from '@reduxjs/toolkit'
import { canvasToolsSlice } from './slices/canvasToolsSlice.ts'
export function createCanvasToolsStore() {
  return configureStore({ reducer: canvasToolsSlice.reducer, devTools: false })
}
