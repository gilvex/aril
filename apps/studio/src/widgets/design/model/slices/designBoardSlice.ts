import type { DesignBoardState } from '@/widgets/design/types/designBoardState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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
