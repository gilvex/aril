import type { DeploymentSettings } from '../../types/deploymentSettings.ts'
import { createSlice } from '@reduxjs/toolkit'

export const deploymentSettingsSlice = createSlice({
  name: 'deploymentSettings',
  initialState: {
    productSiteEnabled: true,
    productName: 'Aril',
    productLogoUrl: '/aril.svg',
  },
  reducers: {
    loaded: (state, action: { payload: DeploymentSettings }) => {
      Object.assign(state, action.payload)
    },
  },
})
