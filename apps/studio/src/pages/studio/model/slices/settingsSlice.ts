import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SettingsState } from '../../types/settingsState.ts'
export const settingsSlice = createSlice({
  name: 'workspaceSettings',
  initialState: {
    section: 'file',
    role: null,
    members: [],
    loading: true,
    busy: false,
    error: '',
    confirming: null,
  } as SettingsState,
  reducers: {
    changed: (state, action: PayloadAction<Partial<SettingsState>>) =>
      Object.assign(state, action.payload),
    loadMembers: () => {},
    changeMember: (
      _state,
      _action: PayloadAction<{ id: string; role?: 'member' | 'viewer' }>,
    ) => {},
  },
})
