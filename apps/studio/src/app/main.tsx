import {
  getProductBranding,
  isProductSiteEnabled,
  loadDeploymentSettings,
} from '@/shared/deploymentSettings/index.ts'
import { ChangelogPage } from '@/pages/changelog/index.ts'
import { App } from '@/app/ui/App.tsx'
import { initializeLanguage } from '@/shared/i18n/index.ts'
import { initializeTheme } from '@/shared/utils/initializeTheme.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/manrope'
import '@xyflow/react/dist/style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import 'vagabond-ui/styles.css'
import './styles.css'
import './theme.css'
import './accent.css'
import './vagabond.css'
import { initializeAccent } from '@/shared/utils/initializeAccent.ts'
import { registerServiceWorker } from './utils/registerServiceWorker.ts'

initializeTheme()
initializeAccent()
initializeLanguage()
registerServiceWorker()

await loadDeploymentSettings()
document.title = getProductBranding().productName
const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
if (favicon) {
  favicon.href = getProductBranding().productLogoUrl
  favicon.removeAttribute('type')
}
const appleTitle = document.querySelector(
  'meta[name="apple-mobile-web-app-title"]',
)
appleTitle?.setAttribute('content', getProductBranding().productName)
if (!isProductSiteEnabled()) {
  const url = new URL(location.href)
  if (url.pathname.replace(/\/$/, '') === '/changelog') {
    url.pathname = '/'
    url.hash = ''
  }
  if (url.searchParams.get('demo') === '1') {
    for (const key of ['demo', 'workspace', 'board', 'view'])
      url.searchParams.delete(key)
  }
  history.replaceState(null, '', url.pathname + url.search + url.hash)
}

if (isDemoMode()) {
  const { initializeDemo } = await import('./utils/initializeDemo.ts')
  initializeDemo()
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isProductSiteEnabled() &&
    window.location.pathname.replace(/\/$/, '') === '/changelog' ? (
      <ChangelogPage />
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
