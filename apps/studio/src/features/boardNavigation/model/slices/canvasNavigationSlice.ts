import type { CanvasNavigationState } from '@/features/boardNavigation/types/canvasNavigationState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const canvasNavigationSlice = createSlice({
  name: 'canvasNavigation',
  initialState: {} as CanvasNavigationState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload
    },
    setOpen: (state, action: PayloadAction<CanvasNavigationState['open']>) => {
      state.open = action.payload
      if (!action.payload) state.query = ''
    },
    setRenaming: (
      state,
      action: PayloadAction<CanvasNavigationState['renaming']>,
    ) => {
      state.renaming = action.payload
    },
    setName: (state, action: PayloadAction<CanvasNavigationState['name']>) => {
      state.name = action.payload
    },
  },
})
