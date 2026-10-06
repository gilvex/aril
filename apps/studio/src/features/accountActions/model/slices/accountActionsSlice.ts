import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AccountAction } from '../../types/accountAction.ts'

export const accountActionsSlice = createSlice({
  name: 'accountActions',
  initialState: {
    busy: false,
    error: '',
    confirmation: null as AccountAction | null,
  },
  reducers: {
    requested: (
      _state,
      _action: PayloadAction<{ mode: AccountAction; confirmed?: boolean }>,
    ) => {},
    started: (state) => {
      state.busy = true
      state.error = ''
      state.confirmation = null
    },
    confirm: (state, action: PayloadAction<AccountAction>) => {
      state.busy = false
      state.confirmation = action.payload
    },
    cancel: (state) => {
      state.confirmation = null
    },
    failed: (state, action: PayloadAction<string>) => {
      state.busy = false
      state.error = action.payload
    },
  },
})
