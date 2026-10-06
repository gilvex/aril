import { createSelector } from '@reduxjs/toolkit'
import type { WireframeBoardState } from '../../types/wireframeBoardState.ts'

export const selectWireframeBoard = createSelector(
  [(state: WireframeBoardState) => state],
  (state) => ({
    ...state,
    selection: new Set(state.selection),
    moving: new Set(state.moving),
  }),
)
