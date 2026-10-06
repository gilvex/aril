import type { MultiplayerState } from '@/features/liveSession/types/multiplayerState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectMultiplayer = createSelector(
  [(state: MultiplayerState) => state],
  (state) => ({ ...state }),
)
