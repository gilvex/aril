import { configureStore } from '@reduxjs/toolkit'
import type { WireframeBoardState } from '../types/wireframeBoardState.ts'
import { selectWireframeBoard } from './selectors/selectWireframeBoard.ts'
import { wireframeBoardSlice } from './slices/wireframeBoardSlice.ts'

export function createWireframeBoardModel(initial: WireframeBoardState) {
  const store = configureStore({
    reducer: wireframeBoardSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectWireframeBoard(store.getState())
  const actions = {
    setTool: (
      value:
        | WireframeBoardState['tool']
        | ((
            current: WireframeBoardState['tool'],
          ) => WireframeBoardState['tool']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().tool) : value
      store.dispatch(wireframeBoardSlice.actions.setTool(next))
    },
    setInspectorOpen: (
      value:
        | WireframeBoardState['inspectorPreference']
        | ((
            current: WireframeBoardState['inspectorPreference'],
          ) => WireframeBoardState['inspectorPreference']),
    ) => {
      const next =
        typeof value === 'function'
          ? value(getSnapshot().inspectorPreference)
          : value
      store.dispatch(wireframeBoardSlice.actions.setInspectorOpen(next))
    },
    setTouchSelection: (
      value:
        | WireframeBoardState['touchSelection']
        | ((
            current: WireframeBoardState['touchSelection'],
          ) => WireframeBoardState['touchSelection']),
    ) => {
      const next =
        typeof value === 'function'
          ? value(getSnapshot().touchSelection)
          : value
      store.dispatch(wireframeBoardSlice.actions.setTouchSelection(next))
    },
    setSelection: (
      value: Set<string> | ((current: Set<string>) => Set<string>),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().selection) : value
      store.dispatch(wireframeBoardSlice.actions.setSelection([...next]))
    },
    setEdgeId: (
      value:
        | WireframeBoardState['edgeId']
        | ((
            current: WireframeBoardState['edgeId'],
          ) => WireframeBoardState['edgeId']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().edgeId) : value
      store.dispatch(wireframeBoardSlice.actions.setEdgeId(next))
    },
    setPalette: (
      value:
        | WireframeBoardState['palette']
        | ((
            current: WireframeBoardState['palette'],
          ) => WireframeBoardState['palette']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().palette) : value
      store.dispatch(wireframeBoardSlice.actions.setPalette(next))
    },
    setInsertPoint: (
      value:
        | WireframeBoardState['insertPoint']
        | ((
            current: WireframeBoardState['insertPoint'],
          ) => WireframeBoardState['insertPoint']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().insertPoint) : value
      store.dispatch(wireframeBoardSlice.actions.setInsertPoint(next))
    },
    setPreview: (
      value:
        | WireframeBoardState['preview']
        | ((
            current: WireframeBoardState['preview'],
          ) => WireframeBoardState['preview']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().preview) : value
      store.dispatch(wireframeBoardSlice.actions.setPreview(next))
    },
    setPreviewMessage: (
      value:
        | WireframeBoardState['previewMessage']
        | ((
            current: WireframeBoardState['previewMessage'],
          ) => WireframeBoardState['previewMessage']),
    ) => {
      const next =
        typeof value === 'function'
          ? value(getSnapshot().previewMessage)
          : value
      store.dispatch(wireframeBoardSlice.actions.setPreviewMessage(next))
    },
    setTargetId: (
      value:
        | WireframeBoardState['targetId']
        | ((
            current: WireframeBoardState['targetId'],
          ) => WireframeBoardState['targetId']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().targetId) : value
      store.dispatch(wireframeBoardSlice.actions.setTargetId(next))
    },
    setTrigger: (
      value:
        | WireframeBoardState['trigger']
        | ((
            current: WireframeBoardState['trigger'],
          ) => WireframeBoardState['trigger']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().trigger) : value
      store.dispatch(wireframeBoardSlice.actions.setTrigger(next))
    },
    setMoving: (
      value: Set<string> | ((current: Set<string>) => Set<string>),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().moving) : value
      store.dispatch(wireframeBoardSlice.actions.setMoving([...next]))
    },
  }
  return { store, getSnapshot, actions }
}
