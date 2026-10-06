import { useRef, useSyncExternalStore } from 'react'
import { createAgentAccessModel } from './createAgentAccessModel.ts'

export function useAgentAccessModel(
  initialize: () => Parameters<typeof createAgentAccessModel>[0],
) {
  const ref = useRef<ReturnType<typeof createAgentAccessModel> | null>(null)
  if (!ref.current) ref.current = createAgentAccessModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
