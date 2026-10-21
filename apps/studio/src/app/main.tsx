import { SourceCodeLink } from '@/shared/ui/index.tsx'
import { resolveEntryRoute } from './utils/resolveEntryRoute.ts'
import {
  getProductBranding,
  isProductSiteEnabled,
  loadDeploymentSettings,
} from '@/shared/deploymentSettings/index.ts'
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
const languageReady = initializeLanguage()
registerServiceWorker()

await Promise.all([languageReady, loadDeploymentSettings()])
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
const entry = resolveEntryRoute(location.href, isProductSiteEnabled())
history.replaceState(history.state, '', entry.href)
// A same-document invitation pasted on the public home must enter the studio too.
window.addEventListener('hashchange', () => {
  const next = resolveEntryRoute(location.href, isProductSiteEnabled())
  if (next.href !== location.pathname + location.search + location.hash)
    location.replace(next.href)
})

if (isDemoMode()) {
  const { initializeDemo } = await import('./utils/initializeDemo.ts')
  initializeDemo()
}

const EntryPage =
  entry.page === 'landing'
    ? (await import('@/pages/landing/index.ts')).LandingPage
    : entry.page === 'changelog'
      ? (await import('@/pages/changelog/index.ts')).ChangelogPage
      : (await import('@/app/ui/App.tsx')).App

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EntryPage />
    <SourceCodeLink />
  </React.StrictMode>,
)
