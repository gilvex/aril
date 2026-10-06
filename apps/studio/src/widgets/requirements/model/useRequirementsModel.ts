import { createRequirementsModel } from '@/widgets/requirements/model/createRequirementsModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useRequirementsModel(
  initialize: () => Parameters<typeof createRequirementsModel>[0],
) {
  const ref = useRef<ReturnType<typeof createRequirementsModel> | null>(null)
  if (!ref.current) ref.current = createRequirementsModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
