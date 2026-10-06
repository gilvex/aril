import '@fontsource-variable/dm-sans'
import '@fontsource-variable/manrope'
import '@xyflow/react/dist/style.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { initializeTheme } from '../shared/utils/initializeTheme.ts'
import './styles.css'
import './theme.css'
import { App } from './ui/App.tsx'

initializeTheme()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
