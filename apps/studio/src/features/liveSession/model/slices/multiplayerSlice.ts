import type { MultiplayerState } from '@/features/liveSession/types/multiplayerState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const multiplayerSlice = createSlice({
  name: 'multiplayer',
  initialState: {} as MultiplayerState,
  reducers: {
    setProfile: (state, action: PayloadAction<MultiplayerState['profile']>) => {
      state.profile = action.payload
    },
    setPeers: (state, action: PayloadAction<MultiplayerState['peers']>) => {
      state.peers = action.payload
    },
    setActivity: (
      state,
      action: PayloadAction<MultiplayerState['activity']>,
    ) => {
      state.activity = action.payload
    },
    setConnected: (
      state,
      action: PayloadAction<MultiplayerState['connected']>,
    ) => {
      state.connected = action.payload
    },
  },
})
