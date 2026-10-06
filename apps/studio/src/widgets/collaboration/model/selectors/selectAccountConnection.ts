import { createSelector } from '@reduxjs/toolkit'
import type { AccountConnectionState } from '../../types/accountConnectionState.ts'

export const selectAccountConnection = createSelector(
  [(state: AccountConnectionState) => state],
  (state) => ({ ...state }),
)
