import { createCanvasNavigationModel } from '@/features/boardNavigation/model/createCanvasNavigationModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useCanvasNavigationModel(
  initialize: () => Parameters<typeof createCanvasNavigationModel>[0],
) {
  const ref = useRef<ReturnType<typeof createCanvasNavigationModel> | null>(
    null,
  )
  if (!ref.current) ref.current = createCanvasNavigationModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
