import type { Workspace } from '@pomegranate/domain/workspace'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkspaceState } from '../../types/workspaceState.ts'
export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {} as WorkspaceState,
  reducers: {
    workspaceChanged: (state, action: PayloadAction<Workspace>) => {
      state.workspace = action.payload
    },
    saveStateChanged: (
      state,
      action: PayloadAction<'saved' | 'pending' | 'saving' | 'error'>,
    ) => {
      state.saveState = action.payload
    },
    errorChanged: (state, action: PayloadAction<string>) => {
      state.error = action.payload
    },
    revisionChanged: (state, action: PayloadAction<number>) => {
      state.revision = action.payload
    },
    historyChanged: (
      state,
      action: PayloadAction<{ canUndo: boolean; canRedo: boolean }>,
    ) => {
      Object.assign(state, action.payload)
      state.historyVersion++
    },
    editQueued: (state) => {
      state.tick++
    },
  },
})
