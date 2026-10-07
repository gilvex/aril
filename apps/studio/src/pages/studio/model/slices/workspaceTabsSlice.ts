import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WorkspaceTabsState } from '../../types/workspaceTabsState.ts'
export const workspaceTabsSlice = createSlice({
  name: 'workspaceTabs',
  initialState: { tabs: [] } as WorkspaceTabsState,
  reducers: {
    opened: (
      state,
      { payload }: PayloadAction<WorkspaceTabsState['tabs'][number]>,
    ) => {
      const index = state.tabs.findIndex((tab) => tab.id === payload.id)
      if (index < 0) state.tabs.push(payload)
      else state.tabs[index] = payload
    },
    closed: (state, { payload }: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((tab) => tab.id !== payload)
    },
  },
})
