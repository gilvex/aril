import { selectCanvasNavigation } from '@/features/boardNavigation/model/selectors/selectCanvasNavigation.ts'
import { canvasNavigationSlice } from '@/features/boardNavigation/model/slices/canvasNavigationSlice.ts'
import type { CanvasNavigationState } from '@/features/boardNavigation/types/canvasNavigationState.ts'
import { configureStore } from '@reduxjs/toolkit'

export function createCanvasNavigationModel(initial: CanvasNavigationState) {
  const store = configureStore({
    reducer: canvasNavigationSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectCanvasNavigation(store.getState())
  const actions = {
    setQuery: (value: string) =>
      store.dispatch(canvasNavigationSlice.actions.setQuery(value)),
    setOpen: (
      value:
        | CanvasNavigationState['open']
        | ((
            current: CanvasNavigationState['open'],
          ) => CanvasNavigationState['open']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().open) : value
      store.dispatch(canvasNavigationSlice.actions.setOpen(next))
    },
    setRenaming: (
      value:
        | CanvasNavigationState['renaming']
        | ((
            current: CanvasNavigationState['renaming'],
          ) => CanvasNavigationState['renaming']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().renaming) : value
      store.dispatch(canvasNavigationSlice.actions.setRenaming(next))
    },
    setName: (
      value:
        | CanvasNavigationState['name']
        | ((
            current: CanvasNavigationState['name'],
          ) => CanvasNavigationState['name']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().name) : value
      store.dispatch(canvasNavigationSlice.actions.setName(next))
    },
  }
  return { store, getSnapshot, actions }
}
