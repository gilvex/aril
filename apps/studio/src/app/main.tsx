import { App } from '@/app/ui/App.tsx'
import { initializeLanguage } from '@/shared/i18n/index.ts'
import { initializeTheme } from '@/shared/utils/initializeTheme.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/manrope'
import '@xyflow/react/dist/style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './theme.css'
import { registerServiceWorker } from './utils/registerServiceWorker.ts'

initializeTheme()
initializeLanguage()
registerServiceWorker()

if (isDemoMode()) {
  const { initializeDemo } = await import('./utils/initializeDemo.ts')
  initializeDemo()
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
