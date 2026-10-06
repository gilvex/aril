import type { CanvasFullscreenState } from '@/features/canvasFullscreen/types/canvasFullscreenState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectCanvasFullscreen = createSelector(
  [(state: CanvasFullscreenState) => state],
  (state) => ({ ...state }),
)
