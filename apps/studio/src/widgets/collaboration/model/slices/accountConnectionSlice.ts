import type { AccountConnectionState } from '@/widgets/collaboration/types/accountConnectionState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const accountConnectionSlice = createSlice({
  name: 'accountConnection',
  initialState: {} as AccountConnectionState,
  reducers: {
    setAccount: (
      state,
      action: PayloadAction<AccountConnectionState['account']>,
    ) => {
      state.account = action.payload
    },
    setError: (
      state,
      action: PayloadAction<AccountConnectionState['error']>,
    ) => {
      state.error = action.payload
    },
  },
})
