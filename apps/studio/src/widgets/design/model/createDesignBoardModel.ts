import { configureStore } from '@reduxjs/toolkit'
import type { DesignBoardState } from '../types/designBoardState.ts'
import { selectDesignBoard } from './selectors/selectDesignBoard.ts'
import { designBoardSlice } from './slices/designBoardSlice.ts'

export function createDesignBoardModel(initial: DesignBoardState) {
  const store = configureStore({
    reducer: designBoardSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectDesignBoard(store.getState())
  const actions = {
    setTab: (
      value:
        | DesignBoardState['tab']
        | ((current: DesignBoardState['tab']) => DesignBoardState['tab']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().tab) : value
      store.dispatch(designBoardSlice.actions.setTab(next))
    },
    setSelected: (
      value:
        | DesignBoardState['selected']
        | ((
            current: DesignBoardState['selected'],
          ) => DesignBoardState['selected']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().selected) : value
      store.dispatch(designBoardSlice.actions.setSelected(next))
    },
  }
  return { store, getSnapshot, actions }
}
