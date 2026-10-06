import { configureStore } from '@reduxjs/toolkit'
import type { RequirementsState } from '../types/requirementsState.ts'
import { selectRequirements } from './selectors/selectRequirements.ts'
import { requirementsSlice } from './slices/requirementsSlice.ts'

export function createRequirementsModel(initial: RequirementsState) {
  const store = configureStore({
    reducer: requirementsSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectRequirements(store.getState())
  const actions = {
    setQuery: (
      value:
        | RequirementsState['query']
        | ((current: RequirementsState['query']) => RequirementsState['query']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().query) : value
      store.dispatch(requirementsSlice.actions.setQuery(next))
    },
    setCategory: (
      value:
        | RequirementsState['category']
        | ((
            current: RequirementsState['category'],
          ) => RequirementsState['category']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().category) : value
      store.dispatch(requirementsSlice.actions.setCategory(next))
    },
    setActivity: (
      value:
        | RequirementsState['activity']
        | ((
            current: RequirementsState['activity'],
          ) => RequirementsState['activity']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().activity) : value
      store.dispatch(requirementsSlice.actions.setActivity(next))
    },
  }
  return { store, getSnapshot, actions }
}
