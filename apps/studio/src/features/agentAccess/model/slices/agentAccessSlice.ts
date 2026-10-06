import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AgentAccessState } from '../../types/agentAccessState.ts'

export const agentAccessSlice = createSlice({
  name: 'agentAccess',
  initialState: {} as AgentAccessState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<AgentAccessState['credentials']>,
    ) => {
      state.credentials = action.payload
    },
    setName: (state, action: PayloadAction<AgentAccessState['name']>) => {
      state.name = action.payload
    },
    setScope: (state, action: PayloadAction<AgentAccessState['scope']>) => {
      state.scope = action.payload
    },
    setDays: (state, action: PayloadAction<AgentAccessState['days']>) => {
      state.days = action.payload
    },
    setError: (state, action: PayloadAction<AgentAccessState['error']>) => {
      state.error = action.payload
    },
    setBusy: (state, action: PayloadAction<AgentAccessState['busy']>) => {
      state.busy = action.payload
    },
    setLoading: (state, action: PayloadAction<AgentAccessState['loading']>) => {
      state.loading = action.payload
    },
  },
})
