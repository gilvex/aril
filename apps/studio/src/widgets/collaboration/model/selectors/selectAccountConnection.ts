import type { AccountConnectionState } from '@/widgets/collaboration/types/accountConnectionState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectAccountConnection = createSelector(
  [(state: AccountConnectionState) => state],
  (state) => ({ ...state }),
)
