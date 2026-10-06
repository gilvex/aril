import { createSelector } from '@reduxjs/toolkit'
import type { CollaborationBarState } from '../../types/collaborationBarState.ts'

export const selectCollaborationBar = createSelector(
  [(state: CollaborationBarState) => state],
  (state) => ({ ...state }),
)
