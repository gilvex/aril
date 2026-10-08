import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CanvasToolsState } from '../../types/canvasToolsState.ts'
import type { CanvasToolMode } from '../../types/canvasToolMode.ts'

const initialState: CanvasToolsState = {
  mode: 'shapes',
  drawing: null,
  color: '#799fee',
  width: 3,
  draft: null,
  pointerId: null,
  dataOpen: false,
  flowIndex: -1,
}
export const canvasToolsSlice = createSlice({
  name: 'canvasTools',
  initialState,
  reducers: {
    mode(state, action: PayloadAction<CanvasToolMode>) {
      state.mode = action.payload
      state.drawing = null
      state.draft = null
      state.pointerId = null
      state.dataOpen = false
    },
    patch(state, action: PayloadAction<Partial<CanvasToolsState>>) {
      Object.assign(state, action.payload)
    },
  },
})
