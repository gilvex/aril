import { configureStore } from '@reduxjs/toolkit'
import { landingMotionSlice } from './slices/landingMotionSlice.ts'
import type { LandingMotionState } from '../types/landingMotionState.ts'

export function createLandingMotionModel(initial: LandingMotionState) {
  const store = configureStore({
    reducer: landingMotionSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  return {
    subscribe: store.subscribe,
    getSnapshot: store.getState,
    togglePaused: () =>
      store.dispatch(landingMotionSlice.actions.togglePaused()),
    updateEnvironment: (value: Partial<Omit<LandingMotionState, 'paused'>>) =>
      store.dispatch(landingMotionSlice.actions.updateEnvironment(value)),
  }
}
