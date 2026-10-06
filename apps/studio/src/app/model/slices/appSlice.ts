import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AppState } from '../../types/appState.ts'

export const appSlice = createSlice({
  name: 'app',
  initialState: {} as AppState,
  reducers: {
    setRestoringRoute: (
      state,
      action: PayloadAction<AppState['restoringRoute']>,
    ) => {
      state.restoringRoute = action.payload
    },
    setRouteNotice: (state, action: PayloadAction<AppState['routeNotice']>) => {
      state.routeNotice = action.payload
    },
    setProfile: (state, action: PayloadAction<AppState['profile']>) => {
      state.profile = action.payload
    },
    setStudio: (state, action: PayloadAction<AppState['studio']>) => {
      state.studio = action.payload
    },
    setInitial: (state, action: PayloadAction<AppState['initial']>) => {
      state.initial = action.payload
    },
    setRecovery: (state, action: PayloadAction<AppState['recovery']>) => {
      state.recovery = action.payload
    },
    setLegacy: (state, action: PayloadAction<AppState['legacy']>) => {
      state.legacy = action.payload
    },
    setStaleDraftKey: (
      state,
      action: PayloadAction<AppState['staleDraftKey']>,
    ) => {
      state.staleDraftKey = action.payload
    },
    setInviteRequired: (
      state,
      action: PayloadAction<AppState['inviteRequired']>,
    ) => {
      state.inviteRequired = action.payload
    },
    setToken: (state, action: PayloadAction<AppState['token']>) => {
      state.token = action.payload
    },
    setName: (state, action: PayloadAction<AppState['name']>) => {
      state.name = action.payload
    },
    setBusy: (state, action: PayloadAction<AppState['busy']>) => {
      state.busy = action.payload
    },
    setError: (state, action: PayloadAction<AppState['error']>) => {
      state.error = action.payload
    },
  },
})
