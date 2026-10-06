import { configureStore } from '@reduxjs/toolkit'
import type { CanvasBoardState } from '../types/canvasBoardState.ts'
import { selectCanvasBoard } from './selectors/selectCanvasBoard.ts'
import { canvasBoardSlice } from './slices/canvasBoardSlice.ts'

export function createCanvasBoardModel(initial: CanvasBoardState) {
  const store = configureStore({
    reducer: canvasBoardSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectCanvasBoard(store.getState())
  const actions = {
    setLocalDragging: (
      value: Set<string> | ((current: Set<string>) => Set<string>),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().localDragging) : value
      store.dispatch(canvasBoardSlice.actions.setLocalDragging([...next]))
    },
    setTool: (
      value:
        | CanvasBoardState['tool']
        | ((current: CanvasBoardState['tool']) => CanvasBoardState['tool']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().tool) : value
      store.dispatch(canvasBoardSlice.actions.setTool(next))
    },
    setInspectorOpen: (
      value:
        | CanvasBoardState['inspectorPreference']
        | ((
            current: CanvasBoardState['inspectorPreference'],
          ) => CanvasBoardState['inspectorPreference']),
    ) => {
      const next =
        typeof value === 'function'
          ? value(getSnapshot().inspectorPreference)
          : value
      store.dispatch(canvasBoardSlice.actions.setInspectorOpen(next))
    },
    setTouchSelection: (
      value:
        | CanvasBoardState['touchSelection']
        | ((
            current: CanvasBoardState['touchSelection'],
          ) => CanvasBoardState['touchSelection']),
    ) => {
      const next =
        typeof value === 'function'
          ? value(getSnapshot().touchSelection)
          : value
      store.dispatch(canvasBoardSlice.actions.setTouchSelection(next))
    },
    setSelectedIds: (
      value: Set<string> | ((current: Set<string>) => Set<string>),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().selectedIds) : value
      store.dispatch(canvasBoardSlice.actions.setSelectedIds([...next]))
    },
    setSelectedEdge: (
      value:
        | CanvasBoardState['selectedEdge']
        | ((
            current: CanvasBoardState['selectedEdge'],
          ) => CanvasBoardState['selectedEdge']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().selectedEdge) : value
      store.dispatch(canvasBoardSlice.actions.setSelectedEdge(next))
    },
    setDimensions: (
      value:
        | CanvasBoardState['dimensions']
        | ((
            current: CanvasBoardState['dimensions'],
          ) => CanvasBoardState['dimensions']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().dimensions) : value
      store.dispatch(canvasBoardSlice.actions.setDimensions(next))
    },
    setPalette: (
      value:
        | CanvasBoardState['palette']
        | ((
            current: CanvasBoardState['palette'],
          ) => CanvasBoardState['palette']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().palette) : value
      store.dispatch(canvasBoardSlice.actions.setPalette(next))
    },
    setInsertPoint: (
      value:
        | CanvasBoardState['insertPoint']
        | ((
            current: CanvasBoardState['insertPoint'],
          ) => CanvasBoardState['insertPoint']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().insertPoint) : value
      store.dispatch(canvasBoardSlice.actions.setInsertPoint(next))
    },
  }
  return { store, getSnapshot, actions }
}
