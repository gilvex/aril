import { createCanvasFullscreenModel } from '@/features/canvasFullscreen/model/createCanvasFullscreenModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useCanvasFullscreenModel(
  initialize: () => Parameters<typeof createCanvasFullscreenModel>[0],
) {
  const ref = useRef<ReturnType<typeof createCanvasFullscreenModel> | null>(
    null,
  )
  if (!ref.current) ref.current = createCanvasFullscreenModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
