import { useRef, useSyncExternalStore } from 'react'
import { createCollaborationBarModel } from './createCollaborationBarModel.ts'

export function useCollaborationBarModel(
  initialize: () => Parameters<typeof createCollaborationBarModel>[0],
) {
  const ref = useRef<ReturnType<typeof createCollaborationBarModel> | null>(
    null,
  )
  if (!ref.current) ref.current = createCollaborationBarModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
