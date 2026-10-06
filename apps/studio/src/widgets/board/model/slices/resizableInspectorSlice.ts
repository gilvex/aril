import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ResizableInspectorState } from '../../types/resizableInspectorState.ts'

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
