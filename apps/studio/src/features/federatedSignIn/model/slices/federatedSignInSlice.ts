import { createSlice } from '@reduxjs/toolkit'

export const federatedSignInSlice = createSlice({
  name: 'federatedSignIn',
  initialState: {
    enabled: false,
    label: 'SSO',
    pending: false,
    failed: false,
  },
  reducers: {
    configured: (
      state,
      action: { payload: { enabled: boolean; label: string } },
    ) => {
      state.enabled = action.payload.enabled
      state.label = action.payload.label
    },
    started: (state) => {
      state.pending = true
      state.failed = false
    },
    failed: (state) => {
      state.pending = false
      state.failed = true
    },
  },
})
