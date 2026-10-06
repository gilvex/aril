import { createSelector } from '@reduxjs/toolkit'
import type { CanvasFullscreenState } from '../../types/canvasFullscreenState.ts'

export const selectCanvasFullscreen = createSelector(
  [(state: CanvasFullscreenState) => state],
  (state) => ({ ...state }),
)
