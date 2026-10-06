import { createWireframeBoardModel } from '@/widgets/board/model/createWireframeBoardModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useWireframeBoardModel(
  initialize: () => Parameters<typeof createWireframeBoardModel>[0],
) {
  const ref = useRef<ReturnType<typeof createWireframeBoardModel> | null>(null)
  if (!ref.current) ref.current = createWireframeBoardModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
