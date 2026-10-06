import { createCanvasBoardModel } from '@/widgets/board/model/createCanvasBoardModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useCanvasBoardModel(
  initialize: () => Parameters<typeof createCanvasBoardModel>[0],
) {
  const ref = useRef<ReturnType<typeof createCanvasBoardModel> | null>(null)
  if (!ref.current) ref.current = createCanvasBoardModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
