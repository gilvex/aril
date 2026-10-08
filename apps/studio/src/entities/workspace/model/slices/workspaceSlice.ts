import type { WorkspaceState } from '@/entities/workspace/types/workspaceState.ts'
import type { Workspace } from '@pomegranate/domain/workspace'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {} as WorkspaceState,
  reducers: {
    liveFieldsReceived: (
      state,
      action: PayloadAction<
        import('../../types/liveFieldPreview.ts').LiveFieldPreview
      >,
    ) => {
      const incoming = action.payload
      if ((state.liveFields[incoming.id]?.sequence ?? -1) >= incoming.sequence)
        return
      if (
        !state.liveFields[incoming.id] &&
        Object.keys(state.liveFields).length >= 64
      )
        return
      const previous = state.liveFields[incoming.id]
      state.liveFields[incoming.id] =
        !incoming.operations.length && previous?.operations.length
          ? { ...previous, sequence: incoming.sequence }
          : incoming
    },
    liveFieldsPruned: (state, action: PayloadAction<number>) => {
      for (const [id, value] of Object.entries(state.liveFields))
        if (value.receivedAt < action.payload) delete state.liveFields[id]
    },
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
