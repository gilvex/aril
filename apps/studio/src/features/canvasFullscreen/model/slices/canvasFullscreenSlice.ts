import type { CanvasFullscreenState } from '@/features/canvasFullscreen/types/canvasFullscreenState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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
