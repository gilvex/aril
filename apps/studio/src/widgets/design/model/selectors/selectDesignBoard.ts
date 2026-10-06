import type { DesignBoardState } from '@/widgets/design/types/designBoardState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectDesignBoard = createSelector(
  [(state: DesignBoardState) => state],
  (state) => ({ ...state }),
)
