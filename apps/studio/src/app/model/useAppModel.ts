import { createAppModel } from '@/app/model/createAppModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useAppModel(
  initialize: () => Parameters<typeof createAppModel>[0],
) {
  const ref = useRef<ReturnType<typeof createAppModel> | null>(null)
  if (!ref.current) ref.current = createAppModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
