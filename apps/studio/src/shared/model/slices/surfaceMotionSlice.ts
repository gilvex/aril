import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
export const surfaceMotionSlice = createSlice({
  name: 'surfaceMotion',
  initialState: { x: 0, y: 0 },
  reducers: {
    move(_state, action: PayloadAction<{ x: number; y: number }>) {
      return action.payload
    },
  },
})
