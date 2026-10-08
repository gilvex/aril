import { useContext, useMemo, useSyncExternalStore } from 'react'
import { CanvasToolsContext } from './canvasToolsContext.ts'
import { canvasToolsSlice } from './slices/canvasToolsSlice.ts'
import type { CanvasToolsState } from '../types/canvasToolsState.ts'
import type { CanvasToolMode } from '../types/canvasToolMode.ts'
export function useCanvasTools() {
  const store = useContext(CanvasToolsContext)
  if (!store) throw new Error('Canvas tools require a provider')
  const state = useSyncExternalStore(store.subscribe, store.getState)
  const commands = useMemo(
    () => ({
      patch: (value: Partial<CanvasToolsState>) =>
        store.dispatch(canvasToolsSlice.actions.patch(value)),
      setMode: (mode: CanvasToolMode) =>
        store.dispatch(canvasToolsSlice.actions.mode(mode)),
      getState: store.getState,
    }),
    [store],
  )
  return { ...state, ...commands }
}
