import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DesignBoardState } from '../../types/designBoardState.ts'

export const designBoardSlice = createSlice({
  name: 'designBoard',
  initialState: {} as DesignBoardState,
  reducers: {
    setTab: (state, action: PayloadAction<DesignBoardState['tab']>) => {
      state.tab = action.payload
    },
    setSelected: (
      state,
      action: PayloadAction<DesignBoardState['selected']>,
    ) => {
      state.selected = action.payload
    },
  },
})
