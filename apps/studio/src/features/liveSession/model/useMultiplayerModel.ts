import { createMultiplayerModel } from '@/features/liveSession/model/createMultiplayerModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useMultiplayerModel(
  initialize: () => Parameters<typeof createMultiplayerModel>[0],
) {
  const ref = useRef<ReturnType<typeof createMultiplayerModel> | null>(null)
  if (!ref.current) ref.current = createMultiplayerModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
