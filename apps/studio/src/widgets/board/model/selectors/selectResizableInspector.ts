import type { ResizableInspectorState } from '@/widgets/board/types/resizableInspectorState.ts'
import { createSelector } from '@reduxjs/toolkit'

export const selectResizableInspector = createSelector(
  [(state: ResizableInspectorState) => state],
  (state) => ({ ...state }),
)
