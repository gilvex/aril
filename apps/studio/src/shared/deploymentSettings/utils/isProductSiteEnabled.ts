import { deploymentSettingsStore } from '../model/deploymentSettingsStore.ts'

export function isProductSiteEnabled() {
  return deploymentSettingsStore.getState().productSiteEnabled
}
