import type { AppState } from '@/app/types/appState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectApp = createSelector(
  [(state: AppState) => state],
  (state) => ({ ...state }),
)
