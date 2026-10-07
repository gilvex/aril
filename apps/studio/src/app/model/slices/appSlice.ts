import type { AppState } from '@/app/types/appState.ts'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export const appSlice = createSlice({
  name: 'app',
  initialState: {} as AppState,
  reducers: {
    closeWorkspace: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(
        (entry) => entry.studio.id !== action.payload,
      )
    },
    setGoogleLinked: (state, action: PayloadAction<boolean>) => {
      state.googleLinked = action.payload
    },
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
      if (state.profile?.id !== action.payload?.id) state.sessions = []
      state.profile = action.payload
    },
    setStudio: (state, action: PayloadAction<AppState['studio']>) => {
      state.studio = action.payload
    },
    setInitial: (state, action: PayloadAction<AppState['initial']>) => {
      state.initial = action.payload
      if (action.payload && state.studio && state.profile) {
        const index = state.sessions.findIndex(
          (entry) => entry.studio.id === state.studio!.id,
        )
        const entry = {
          studio: state.studio,
          initial: action.payload,
          recovery: state.recovery,
        }
        if (index < 0) state.sessions.push(entry)
        else state.sessions[index] = entry
      }
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
