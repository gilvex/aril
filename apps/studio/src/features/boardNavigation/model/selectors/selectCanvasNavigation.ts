import { createSelector } from '@reduxjs/toolkit'
import type { CanvasNavigationState } from '../../types/canvasNavigationState.ts'

export const selectCanvasNavigation = createSelector(
  [(state: CanvasNavigationState) => state],
  (state) => ({ ...state }),
)
