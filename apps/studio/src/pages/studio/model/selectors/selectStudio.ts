import type { StudioState } from '@/pages/studio/types/studioState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectStudio = createSelector(
  [(state: StudioState) => state],
  (state) => ({ ...state }),
)
