import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkspaceManagementState } from '../../types/workspaceManagementState.ts'
export const workspaceManagementSlice = createSlice({
  name: 'workspaceManagement',
  initialState: {
    management: null,
    name: '',
    busy: false,
    error: '',
  } as WorkspaceManagementState,
  reducers: {
    changed: (
      state,
      action: PayloadAction<Partial<WorkspaceManagementState>>,
    ) => Object.assign(state, action.payload),
  },
})
