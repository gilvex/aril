import { createContext } from 'react'
import type { createCanvasToolsStore } from './createCanvasToolsStore.ts'
export const CanvasToolsContext = createContext<ReturnType<
  typeof createCanvasToolsStore
> | null>(null)
