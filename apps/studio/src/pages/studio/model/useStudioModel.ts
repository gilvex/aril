import { createStudioModel } from '@/pages/studio/model/createStudioModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useStudioModel(
  initialize: () => Parameters<typeof createStudioModel>[0],
) {
  const ref = useRef<ReturnType<typeof createStudioModel> | null>(null)
  if (!ref.current) ref.current = createStudioModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
