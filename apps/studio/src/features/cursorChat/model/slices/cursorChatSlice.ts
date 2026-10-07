import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
export const cursorChatSlice = createSlice({
  name: 'cursorChat',
  initialState: { open: false, text: '', expiresAt: 0, x: 100, y: 100 },
  reducers: {
    patch: (
      state,
      action: PayloadAction<
        Partial<{
          open: boolean
          text: string
          expiresAt: number
          x: number
          y: number
        }>
      >,
    ) => ({ ...state, ...action.payload }),
  },
})
