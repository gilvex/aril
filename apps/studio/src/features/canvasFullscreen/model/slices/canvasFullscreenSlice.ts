import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CanvasFullscreenState } from '../../types/canvasFullscreenState.ts'

export const canvasFullscreenSlice = createSlice({
  name: 'canvasFullscreen',
  initialState: {} as CanvasFullscreenState,
  reducers: {
    setFullscreen: (
      state,
      action: PayloadAction<CanvasFullscreenState['fullscreen']>,
    ) => {
      state.fullscreen = action.payload
    },
  },
})
