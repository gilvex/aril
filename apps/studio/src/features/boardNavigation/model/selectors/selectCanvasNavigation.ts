import type { CanvasNavigationState } from '@/features/boardNavigation/types/canvasNavigationState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectCanvasNavigation = createSelector(
  [(state: CanvasNavigationState) => state],
  (state) => ({ ...state }),
)
