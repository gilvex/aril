import { createSelector } from '@reduxjs/toolkit'
import type { CanvasBoardState } from '../../types/canvasBoardState.ts'

export const selectCanvasBoard = createSelector(
  [(state: CanvasBoardState) => state],
  (state) => ({
    ...state,
    localDragging: new Set(state.localDragging),
    selectedIds: new Set(state.selectedIds),
  }),
)
