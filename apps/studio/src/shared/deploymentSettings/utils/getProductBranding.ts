import { deploymentSettingsStore } from '../model/deploymentSettingsStore.ts'

export function getProductBranding() {
  const { productName, productLogoUrl } = deploymentSettingsStore.getState()
  return { productName, productLogoUrl }
}
