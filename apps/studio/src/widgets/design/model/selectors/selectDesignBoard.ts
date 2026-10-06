import { createSelector } from '@reduxjs/toolkit'
import type { DesignBoardState } from '../../types/designBoardState.ts'

export const selectDesignBoard = createSelector(
  [(state: DesignBoardState) => state],
  (state) => ({ ...state }),
)
