import type { WorkspaceHomeState } from '@/pages/workspaces/types/workspaceHomeState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectWorkspaceHome = createSelector(
  [(state: WorkspaceHomeState) => state],
  (state) => ({ ...state }),
)
