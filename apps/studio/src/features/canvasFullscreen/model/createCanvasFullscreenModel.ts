import { selectCanvasFullscreen } from '@/features/canvasFullscreen/model/selectors/selectCanvasFullscreen.ts'
import { canvasFullscreenSlice } from '@/features/canvasFullscreen/model/slices/canvasFullscreenSlice.ts'
import type { CanvasFullscreenState } from '@/features/canvasFullscreen/types/canvasFullscreenState.ts'
import { configureStore } from '@reduxjs/toolkit'

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
