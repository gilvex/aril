import { configureStore } from '@reduxjs/toolkit'
import type { CanvasFullscreenState } from '../types/canvasFullscreenState.ts'
import { selectCanvasFullscreen } from './selectors/selectCanvasFullscreen.ts'
import { canvasFullscreenSlice } from './slices/canvasFullscreenSlice.ts'

export function createCanvasFullscreenModel(initial: CanvasFullscreenState) {
  const store = configureStore({
    reducer: canvasFullscreenSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectCanvasFullscreen(store.getState())
  const actions = {
    setFullscreen: (
      value:
        | CanvasFullscreenState['fullscreen']
        | ((
            current: CanvasFullscreenState['fullscreen'],
          ) => CanvasFullscreenState['fullscreen']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().fullscreen) : value
      store.dispatch(canvasFullscreenSlice.actions.setFullscreen(next))
    },
  }
  return { store, getSnapshot, actions }
}
