import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import '@fontsource-variable/manrope'
import '@fontsource-variable/dm-sans'
import '@xyflow/react/dist/style.css'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
