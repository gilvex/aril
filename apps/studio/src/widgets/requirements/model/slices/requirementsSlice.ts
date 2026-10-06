import type { RequirementsState } from '@/widgets/requirements/types/requirementsState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const requirementsSlice = createSlice({
  name: 'requirements',
  initialState: {} as RequirementsState,
  reducers: {
    setViewState: (
      state,
      action: PayloadAction<Partial<Omit<RequirementsState, 'activity'>>>,
    ) => {
      Object.assign(state, action.payload)
    },
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
