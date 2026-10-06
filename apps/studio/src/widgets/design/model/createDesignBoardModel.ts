import { selectDesignBoard } from '@/widgets/design/model/selectors/selectDesignBoard.ts'
import { designBoardSlice } from '@/widgets/design/model/slices/designBoardSlice.ts'
import type { DesignBoardState } from '@/widgets/design/types/designBoardState.ts'
import { configureStore } from '@reduxjs/toolkit'

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
