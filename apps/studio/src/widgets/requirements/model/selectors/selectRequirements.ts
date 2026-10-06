import type { RequirementsState } from '@/widgets/requirements/types/requirementsState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectRequirements = createSelector(
  [(state: RequirementsState) => state],
  (state) => ({ ...state }),
)
