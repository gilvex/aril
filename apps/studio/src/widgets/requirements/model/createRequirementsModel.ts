import { selectRequirements } from '@/widgets/requirements/model/selectors/selectRequirements.ts'
import { requirementsSlice } from '@/widgets/requirements/model/slices/requirementsSlice.ts'
import type { RequirementsState } from '@/widgets/requirements/types/requirementsState.ts'
import { configureStore } from '@reduxjs/toolkit'

export function createRequirementsModel(initial: RequirementsState) {
  const store = configureStore({
    reducer: requirementsSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectRequirements(store.getState())
  const actions = {
    setViewState: (patch: Partial<Omit<RequirementsState, 'activity'>>) => {
      store.dispatch(requirementsSlice.actions.setViewState(patch))
    },
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
