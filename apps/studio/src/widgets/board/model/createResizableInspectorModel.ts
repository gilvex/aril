import { selectResizableInspector } from '@/widgets/board/model/selectors/selectResizableInspector.ts'
import { resizableInspectorSlice } from '@/widgets/board/model/slices/resizableInspectorSlice.ts'
import type { ResizableInspectorState } from '@/widgets/board/types/resizableInspectorState.ts'
import { configureStore } from '@reduxjs/toolkit'

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
