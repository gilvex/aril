import { configureStore } from '@reduxjs/toolkit'
import type { ResizableInspectorState } from '../types/resizableInspectorState.ts'
import { selectResizableInspector } from './selectors/selectResizableInspector.ts'
import { resizableInspectorSlice } from './slices/resizableInspectorSlice.ts'

export function createResizableInspectorModel(
  initial: ResizableInspectorState,
) {
  const store = configureStore({
    reducer: resizableInspectorSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectResizableInspector(store.getState())
  const actions = {
    setLimit: (
      value:
        | ResizableInspectorState['limit']
        | ((
            current: ResizableInspectorState['limit'],
          ) => ResizableInspectorState['limit']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().limit) : value
      store.dispatch(resizableInspectorSlice.actions.setLimit(next))
    },
    setWidth: (
      value:
        | ResizableInspectorState['width']
        | ((
            current: ResizableInspectorState['width'],
          ) => ResizableInspectorState['width']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().width) : value
      store.dispatch(resizableInspectorSlice.actions.setWidth(next))
    },
    setResizing: (
      value:
        | ResizableInspectorState['resizing']
        | ((
            current: ResizableInspectorState['resizing'],
          ) => ResizableInspectorState['resizing']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().resizing) : value
      store.dispatch(resizableInspectorSlice.actions.setResizing(next))
    },
  }
  return { store, getSnapshot, actions }
}
