import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createDesignEditorState } from '../createDesignEditorState.ts'
import type { DesignEditorState } from '../../types/designEditorState.ts'
export const designEditorSlice = createSlice({
  name: 'designEditor',
  initialState: createDesignEditorState(),
  reducers: {
    patch(state, action: PayloadAction<Partial<DesignEditorState>>) {
      const openingLayers = action.payload.layers && !state.layers
      const openingInspector = action.payload.inspector && !state.inspector
      Object.assign(state, action.payload)
      if (openingLayers) state.dockActive = 'left'
      if (openingInspector) state.dockActive = 'right'
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
      if (state.pagesOpen) state.mobileToolsTab = 'pages'
      else if (state.layers) state.mobileToolsTab = state.leftTab
      else if (state.inspector) state.mobileToolsTab = 'properties'
    },
  },
})
