import { useMemo, type ReactNode } from 'react'
import { CanvasToolsContext } from '../model/canvasToolsContext.ts'
import { createCanvasToolsStore } from '../model/createCanvasToolsStore.ts'
export function CanvasToolsProvider({ children }: { children: ReactNode }) {
  const store = useMemo(createCanvasToolsStore, [])
  return <CanvasToolsContext value={store}>{children}</CanvasToolsContext>
}
