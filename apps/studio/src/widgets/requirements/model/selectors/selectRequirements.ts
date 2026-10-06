import { createSelector } from '@reduxjs/toolkit'
import type { RequirementsState } from '../../types/requirementsState.ts'

export const selectRequirements = createSelector(
  [(state: RequirementsState) => state],
  (state) => ({ ...state }),
)
