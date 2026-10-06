import type { WireframeBoardState } from '@/widgets/board/types/wireframeBoardState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectWireframeBoard = createSelector(
  [(state: WireframeBoardState) => state],
  (state) => ({
    ...state,
    selection: new Set(state.selection),
    moving: new Set(state.moving),
  }),
)
