import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RequirementsState } from '../../types/requirementsState.ts'

export const requirementsSlice = createSlice({
  name: 'requirements',
  initialState: {} as RequirementsState,
  reducers: {
    setQuery: (state, action: PayloadAction<RequirementsState['query']>) => {
      state.query = action.payload
    },
    setCategory: (
      state,
      action: PayloadAction<RequirementsState['category']>,
    ) => {
      state.category = action.payload
    },
    setActivity: (
      state,
      action: PayloadAction<RequirementsState['activity']>,
    ) => {
      state.activity = action.payload
    },
  },
})
