import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createDesignEditorState } from '../createDesignEditorState.ts'
import type { DesignEditorState } from '../../types/designEditorState.ts'
export const designEditorSlice = createSlice({
  name: 'designEditor',
  initialState: createDesignEditorState(),
  reducers: {
    patch(state, action: PayloadAction<Partial<DesignEditorState>>) {
      Object.assign(state, action.payload)
      if (!state.compact) return
      if (
        action.payload.pagesOpen ||
        (action.payload.compact && state.pagesOpen)
      ) {
        state.layers = false
        state.inspector = false
      } else if (action.payload.layers) {
        state.pagesOpen = false
        state.inspector = false
      } else if (action.payload.inspector) {
        state.pagesOpen = false
        state.layers = false
      }
      if (state.layers && state.inspector) state.inspector = false
    },
  },
})
