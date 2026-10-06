import type { CanvasBoardState } from '@/widgets/board/types/canvasBoardState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectCanvasBoard = createSelector(
  [(state: CanvasBoardState) => state],
  (state) => ({
    ...state,
    localDragging: new Set(state.localDragging),
    selectedIds: new Set(state.selectedIds),
  }),
)
