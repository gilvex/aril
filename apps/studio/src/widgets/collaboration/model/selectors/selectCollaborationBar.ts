import type { CollaborationBarState } from '@/widgets/collaboration/types/collaborationBarState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectCollaborationBar = createSelector(
  [(state: CollaborationBarState) => state],
  (state) => ({ ...state }),
)
