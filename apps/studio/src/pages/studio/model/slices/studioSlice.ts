import type { StudioState } from '@/pages/studio/types/studioState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const studioSlice = createSlice({
  name: 'studio',
  initialState: {} as StudioState,
  reducers: {
    setNavigationCollapsed: (state, action: PayloadAction<boolean>) => {
      state.navigationCollapsed = action.payload
    },
    setView: (state, action: PayloadAction<StudioState['view']>) => {
      state.view = action.payload
    },
    setCanvasMode: (
      state,
      action: PayloadAction<StudioState['canvasMode']>,
    ) => {
      state.canvasMode = action.payload
    },
    setBoardId: (state, action: PayloadAction<StudioState['boardId']>) => {
      state.boardId = action.payload
    },
    setRequirementId: (
      state,
      action: PayloadAction<StudioState['requirementId']>,
    ) => {
      state.requirementId = action.payload
    },
    setSidebarOpen: (
      state,
      action: PayloadAction<StudioState['sidebarOpen']>,
    ) => {
      state.sidebarOpen = action.payload
    },
    setCollaborationPanel: (
      state,
      action: PayloadAction<StudioState['collaborationPanel']>,
    ) => {
      state.collaborationPanel = action.payload
    },
    setNotice: (state, action: PayloadAction<StudioState['notice']>) => {
      state.notice = action.payload
    },
    setModal: (state, action: PayloadAction<StudioState['modal']>) => {
      state.modal = action.payload
    },
    setBoardName: (state, action: PayloadAction<StudioState['boardName']>) => {
      state.boardName = action.payload
    },
    setPendingImport: (
      state,
      action: PayloadAction<StudioState['pendingImport']>,
    ) => {
      state.pendingImport = action.payload
    },
    setSnapshots: (state, action: PayloadAction<StudioState['snapshots']>) => {
      state.snapshots = action.payload
    },
    setHistoryLoading: (
      state,
      action: PayloadAction<StudioState['historyLoading']>,
    ) => {
      state.historyLoading = action.payload
    },
    setFollowId: (state, action: PayloadAction<StudioState['followId']>) => {
      state.followId = action.payload
    },
  },
})
