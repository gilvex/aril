import { deploymentSettingsStore } from '../model/deploymentSettingsStore.ts'
import { deploymentSettingsSlice } from '../model/slices/deploymentSettingsSlice.ts'

export async function loadDeploymentSettings() {
  let enabled = false
  let productName = 'Aril'
  let productLogoUrl = '/aril.svg'
  try {
    const response = await fetch('/api/deployment-settings', {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })
    if (response.ok) {
      const config: unknown = await response.json()
      if (config && typeof config === 'object') {
        if (
          'productName' in config &&
          typeof config.productName === 'string' &&
          config.productName.trim()
        )
          productName = config.productName
        if (
          'productLogoUrl' in config &&
          typeof config.productLogoUrl === 'string' &&
          config.productLogoUrl
        )
          productLogoUrl = config.productLogoUrl
      }
      enabled = !!(
        config &&
        typeof config === 'object' &&
        'productSiteEnabled' in config &&
        config.productSiteEnabled === true
      )
    }
  } catch {
    /* Keep product pages hidden if runtime configuration is unavailable. */
  }
  deploymentSettingsStore.dispatch(
    deploymentSettingsSlice.actions.loaded({
      productSiteEnabled: enabled,
      productName,
      productLogoUrl,
    }),
  )
}
