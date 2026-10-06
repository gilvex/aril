import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WireframeBoardState } from '../../types/wireframeBoardState.ts'

export const wireframeBoardSlice = createSlice({
  name: 'wireframeBoard',
  initialState: {} as WireframeBoardState,
  reducers: {
    setTool: (state, action: PayloadAction<WireframeBoardState['tool']>) => {
      state.tool = action.payload
    },
    setInspectorOpen: (
      state,
      action: PayloadAction<WireframeBoardState['inspectorPreference']>,
    ) => {
      state.inspectorPreference = action.payload
    },
    setTouchSelection: (
      state,
      action: PayloadAction<WireframeBoardState['touchSelection']>,
    ) => {
      state.touchSelection = action.payload
    },
    setSelection: (
      state,
      action: PayloadAction<WireframeBoardState['selection']>,
    ) => {
      state.selection = action.payload
    },
    setEdgeId: (
      state,
      action: PayloadAction<WireframeBoardState['edgeId']>,
    ) => {
      state.edgeId = action.payload
    },
    setPalette: (
      state,
      action: PayloadAction<WireframeBoardState['palette']>,
    ) => {
      state.palette = action.payload
    },
    setInsertPoint: (
      state,
      action: PayloadAction<WireframeBoardState['insertPoint']>,
    ) => {
      state.insertPoint = action.payload
    },
    setPreview: (
      state,
      action: PayloadAction<WireframeBoardState['preview']>,
    ) => {
      state.preview = action.payload
    },
    setPreviewMessage: (
      state,
      action: PayloadAction<WireframeBoardState['previewMessage']>,
    ) => {
      state.previewMessage = action.payload
    },
    setTargetId: (
      state,
      action: PayloadAction<WireframeBoardState['targetId']>,
    ) => {
      state.targetId = action.payload
    },
    setTrigger: (
      state,
      action: PayloadAction<WireframeBoardState['trigger']>,
    ) => {
      state.trigger = action.payload
    },
    setMoving: (
      state,
      action: PayloadAction<WireframeBoardState['moving']>,
    ) => {
      state.moving = action.payload
    },
  },
})
