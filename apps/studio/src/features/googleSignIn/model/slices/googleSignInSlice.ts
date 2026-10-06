import type { GoogleSignInState } from '@/features/googleSignIn/types/googleSignInState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const googleSignInSlice = createSlice({
  name: 'googleSignIn',
  initialState: {} as GoogleSignInState,
  reducers: {
    setError: (state, action: PayloadAction<GoogleSignInState['error']>) => {
      state.error = action.payload
    },
    setStatus: (state, action: PayloadAction<GoogleSignInState['status']>) => {
      state.status = action.payload
    },
    setRetry: (state, action: PayloadAction<GoogleSignInState['retry']>) => {
      state.retry = action.payload
    },
  },
})
