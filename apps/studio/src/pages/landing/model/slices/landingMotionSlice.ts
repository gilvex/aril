import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { LandingMotionState } from '../../types/landingMotionState.ts'

export const landingMotionSlice = createSlice({
  name: 'landingMotion',
  initialState: {
    paused: false,
    reducedMotion: false,
    inView: true,
    pageVisible: true,
  } satisfies LandingMotionState as LandingMotionState,
  reducers: {
    togglePaused(state) {
      state.paused = !state.paused
    },
    updateEnvironment(
      state,
      action: PayloadAction<Partial<Omit<LandingMotionState, 'paused'>>>,
    ) {
      Object.assign(state, action.payload)
    },
  },
})
