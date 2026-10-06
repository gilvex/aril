import { selectAgentAccess } from '@/features/agentAccess/model/selectors/selectAgentAccess.ts'
import { agentAccessSlice } from '@/features/agentAccess/model/slices/agentAccessSlice.ts'
import type { AgentAccessState } from '@/features/agentAccess/types/agentAccessState.ts'
import { configureStore } from '@reduxjs/toolkit'

export function createAgentAccessModel(initial: AgentAccessState) {
  const store = configureStore({
    reducer: agentAccessSlice.reducer,
    preloadedState: initial,
    devTools: false,
    middleware: (defaults) => defaults({ thunk: false }),
  })
  const getSnapshot = () => selectAgentAccess(store.getState())
  const actions = {
    setCredentials: (
      value:
        | AgentAccessState['credentials']
        | ((
            current: AgentAccessState['credentials'],
          ) => AgentAccessState['credentials']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().credentials) : value
      store.dispatch(agentAccessSlice.actions.setCredentials(next))
    },
    setName: (
      value:
        | AgentAccessState['name']
        | ((current: AgentAccessState['name']) => AgentAccessState['name']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().name) : value
      store.dispatch(agentAccessSlice.actions.setName(next))
    },
    setScope: (
      value:
        | AgentAccessState['scope']
        | ((current: AgentAccessState['scope']) => AgentAccessState['scope']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().scope) : value
      store.dispatch(agentAccessSlice.actions.setScope(next))
    },
    setDays: (
      value:
        | AgentAccessState['days']
        | ((current: AgentAccessState['days']) => AgentAccessState['days']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().days) : value
      store.dispatch(agentAccessSlice.actions.setDays(next))
    },
    setError: (
      value:
        | AgentAccessState['error']
        | ((current: AgentAccessState['error']) => AgentAccessState['error']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().error) : value
      store.dispatch(agentAccessSlice.actions.setError(next))
    },
    setBusy: (
      value:
        | AgentAccessState['busy']
        | ((current: AgentAccessState['busy']) => AgentAccessState['busy']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().busy) : value
      store.dispatch(agentAccessSlice.actions.setBusy(next))
    },
    setLoading: (
      value:
        | AgentAccessState['loading']
        | ((
            current: AgentAccessState['loading'],
          ) => AgentAccessState['loading']),
    ) => {
      const next =
        typeof value === 'function' ? value(getSnapshot().loading) : value
      store.dispatch(agentAccessSlice.actions.setLoading(next))
    },
  }
  return { store, getSnapshot, actions }
}
