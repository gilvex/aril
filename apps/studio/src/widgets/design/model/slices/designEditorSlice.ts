import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createDesignEditorState } from '../createDesignEditorState.ts'
import type { DesignEditorState } from '../../types/designEditorState.ts'
export const designEditorSlice = createSlice({
  name: 'designEditor',
  initialState: createDesignEditorState(),
  reducers: {
    patch(state, action: PayloadAction<Partial<DesignEditorState>>) {
      Object.assign(state, action.payload)
    },
  },
})
