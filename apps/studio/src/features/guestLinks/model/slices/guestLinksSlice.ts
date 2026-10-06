import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { GuestLinksState } from '../../types/guestLinksState.ts'
const initialState: GuestLinksState = {
  links: [],
  name: '',
  duration: 1,
  unit: 60,
  busy: false,
  loading: true,
  error: '',
  copied: false,
}
export const guestLinksSlice = createSlice({
  name: 'guestLinks',
  initialState,
  reducers: {
    patch: (state, action: PayloadAction<Partial<GuestLinksState>>) => {
      Object.assign(state, action.payload)
    },
  },
})
