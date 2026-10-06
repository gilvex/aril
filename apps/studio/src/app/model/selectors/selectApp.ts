import { createSelector } from '@reduxjs/toolkit'
import type { AppState } from '../../types/appState.ts'

export const selectApp = createSelector(
  [(state: AppState) => state],
  (state) => ({ ...state }),
)
