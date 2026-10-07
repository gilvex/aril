import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkspacePickerState } from '../../types/workspacePickerState.ts'
export const workspacePickerSlice = createSlice({
  name: 'workspacePicker',
  initialState: {
    items: [],
    query: '',
    loading: true,
    busy: false,
    error: '',
  } as WorkspacePickerState,
  reducers: {
    patch: (state, action: PayloadAction<Partial<WorkspacePickerState>>) => ({
      ...state,
      ...action.payload,
    }),
  },
})
