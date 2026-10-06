import { createSelector } from '@reduxjs/toolkit'
import type { StudioState } from '../../types/studioState.ts'

export const selectStudio = createSelector(
  [(state: StudioState) => state],
  (state) => ({ ...state }),
)
