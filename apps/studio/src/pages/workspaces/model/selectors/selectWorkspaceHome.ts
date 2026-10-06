import { createSelector } from '@reduxjs/toolkit'
import type { WorkspaceHomeState } from '../../types/workspaceHomeState.ts'

export const selectWorkspaceHome = createSelector(
  [(state: WorkspaceHomeState) => state],
  (state) => ({ ...state }),
)
