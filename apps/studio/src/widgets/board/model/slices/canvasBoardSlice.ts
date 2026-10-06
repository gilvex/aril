import type { CanvasBoardState } from '@/widgets/board/types/canvasBoardState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const canvasBoardSlice = createSlice({
  name: 'canvasBoard',
  initialState: {} as CanvasBoardState,
  reducers: {
    setLocalDragging: (
      state,
      action: PayloadAction<CanvasBoardState['localDragging']>,
    ) => {
      state.localDragging = action.payload
    },
    setTool: (state, action: PayloadAction<CanvasBoardState['tool']>) => {
      state.tool = action.payload
    },
    setInspectorOpen: (
      state,
      action: PayloadAction<CanvasBoardState['inspectorPreference']>,
    ) => {
      state.inspectorPreference = action.payload
    },
    setTouchSelection: (
      state,
      action: PayloadAction<CanvasBoardState['touchSelection']>,
    ) => {
      state.touchSelection = action.payload
    },
    setSelectedIds: (
      state,
      action: PayloadAction<CanvasBoardState['selectedIds']>,
    ) => {
      state.selectedIds = action.payload
    },
    setSelectedEdge: (
      state,
      action: PayloadAction<CanvasBoardState['selectedEdge']>,
    ) => {
      state.selectedEdge = action.payload
    },
    setDimensions: (
      state,
      action: PayloadAction<CanvasBoardState['dimensions']>,
    ) => {
      state.dimensions = action.payload
    },
    setPalette: (state, action: PayloadAction<CanvasBoardState['palette']>) => {
      state.palette = action.payload
    },
    setInsertPoint: (
      state,
      action: PayloadAction<CanvasBoardState['insertPoint']>,
    ) => {
      state.insertPoint = action.payload
    },
  },
})
