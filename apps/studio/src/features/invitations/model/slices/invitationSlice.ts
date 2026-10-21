import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { InvitationState } from '../../types/index.ts'
const initialState: InvitationState = {
  open: false,
  value: '',
  role: 'member',
  selected: null,
  users: [],
  invitations: [],
  loaded: false,
  busy: false,
  error: '',
  message: '',
}
export const invitationSlice = createSlice({
  name: 'invitations',
  initialState,
  reducers: {
    changed: (state, action: PayloadAction<Partial<InvitationState>>) => ({
      ...state,
      ...action.payload,
    }),
  },
})
