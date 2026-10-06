import type { WorkspaceHomeState } from '@/pages/workspaces/types/workspaceHomeState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const workspaceHomeSlice = createSlice({
  name: 'workspaceHome',
  initialState: {} as WorkspaceHomeState,
  reducers: {
    setStudios: (
      state,
      action: PayloadAction<WorkspaceHomeState['studios']>,
    ) => {
      state.studios = action.payload
    },
    setName: (state, action: PayloadAction<WorkspaceHomeState['name']>) => {
      state.name = action.payload
    },
    setCreating: (
      state,
      action: PayloadAction<WorkspaceHomeState['creating']>,
    ) => {
      state.creating = action.payload
    },
    setBusy: (state, action: PayloadAction<WorkspaceHomeState['busy']>) => {
      state.busy = action.payload
    },
    setError: (state, action: PayloadAction<WorkspaceHomeState['error']>) => {
      state.error = action.payload
    },
    setHostedOrigin: (
      state,
      action: PayloadAction<WorkspaceHomeState['hostedOrigin']>,
    ) => {
      state.hostedOrigin = action.payload
    },
  },
})
