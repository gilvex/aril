import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { readAccentPreference } from '../../utils/readAccentPreference.ts'
import type { AccentPreference } from '../../types/accentPreference.ts'
export const accentSlice = createSlice({
  name: 'accentPreference',
  initialState: { value: readAccentPreference() },
  reducers: {
    changed(state, action: PayloadAction<AccentPreference>) {
      state.value = action.payload
    },
  },
})
