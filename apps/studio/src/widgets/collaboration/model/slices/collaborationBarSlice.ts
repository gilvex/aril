import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CollaborationBarState } from '../../types/collaborationBarState.ts'

export const collaborationBarSlice = createSlice({
  name: 'collaborationBar',
  initialState: {} as CollaborationBarState,
  reducers: {
    setName: (state, action: PayloadAction<CollaborationBarState['name']>) => {
      state.name = action.payload
    },
    setAvatar: (
      state,
      action: PayloadAction<CollaborationBarState['avatar']>,
    ) => {
      state.avatar = action.payload
    },
    setBusy: (state, action: PayloadAction<CollaborationBarState['busy']>) => {
      state.busy = action.payload
    },
    setError: (
      state,
      action: PayloadAction<CollaborationBarState['error']>,
    ) => {
      state.error = action.payload
    },
    setInvite: (
      state,
      action: PayloadAction<CollaborationBarState['invite']>,
    ) => {
      state.invite = action.payload
    },
    setCopied: (
      state,
      action: PayloadAction<CollaborationBarState['copied']>,
    ) => {
      state.copied = action.payload
    },
  },
})
