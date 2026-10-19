import { configureStore } from '@reduxjs/toolkit'
import { deploymentSettingsSlice } from './slices/deploymentSettingsSlice.ts'

export const deploymentSettingsStore = configureStore({
  reducer: deploymentSettingsSlice.reducer,
  devTools: false,
})
