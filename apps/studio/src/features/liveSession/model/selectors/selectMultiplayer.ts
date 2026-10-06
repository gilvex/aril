import { createSelector } from '@reduxjs/toolkit'
import type { MultiplayerState } from '../../types/multiplayerState.ts'

export const selectMultiplayer = createSelector(
  [(state: MultiplayerState) => state],
  (state) => ({ ...state }),
)
