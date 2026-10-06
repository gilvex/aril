import { createSelector } from '@reduxjs/toolkit'
import type { ResizableInspectorState } from '../../types/resizableInspectorState.ts'

export const selectResizableInspector = createSelector(
  [(state: ResizableInspectorState) => state],
  (state) => ({ ...state }),
)
