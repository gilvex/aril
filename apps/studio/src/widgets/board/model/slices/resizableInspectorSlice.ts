import type { ResizableInspectorState } from '@/widgets/board/types/resizableInspectorState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const resizableInspectorSlice = createSlice({
  name: 'resizableInspector',
  initialState: {} as ResizableInspectorState,
  reducers: {
    setLimit: (
      state,
      action: PayloadAction<ResizableInspectorState['limit']>,
    ) => {
      state.limit = action.payload
    },
    setWidth: (
      state,
      action: PayloadAction<ResizableInspectorState['width']>,
    ) => {
      state.width = action.payload
    },
    setResizing: (
      state,
      action: PayloadAction<ResizableInspectorState['resizing']>,
    ) => {
      state.resizing = action.payload
    },
  },
})
