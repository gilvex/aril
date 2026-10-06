import { useRef, useSyncExternalStore } from 'react'
import { createCanvasBoardModel } from './createCanvasBoardModel.ts'

export function useCanvasBoardModel(
  initialize: () => Parameters<typeof createCanvasBoardModel>[0],
) {
  const ref = useRef<ReturnType<typeof createCanvasBoardModel> | null>(null)
  if (!ref.current) ref.current = createCanvasBoardModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
