import { useEffect, useRef, useSyncExternalStore } from 'react'
import { createWorkspaceHomeModel } from './createWorkspaceHomeModel.ts'

export function useWorkspaceHomeModel(
  initialize: () => Parameters<typeof createWorkspaceHomeModel>[0],
) {
  const ref = useRef<ReturnType<typeof createWorkspaceHomeModel> | null>(null)
  if (!ref.current) ref.current = createWorkspaceHomeModel(initialize())
  const model = ref.current
  useEffect(() => model.start(), [model])
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
