import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IconPickerState } from '../../types/iconPickerState.ts'
const initialState: IconPickerState = { open: false, query: '', size: 28 }
export const iconPickerSlice = createSlice({
  name: 'iconPicker',
  initialState,
  reducers: {
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.open = action.payload
      if (!action.payload) state.query = ''
    },
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    setSize: (state, action: PayloadAction<number>) => {
      state.size = Math.max(20, Math.min(48, action.payload))
    },
  },
})
