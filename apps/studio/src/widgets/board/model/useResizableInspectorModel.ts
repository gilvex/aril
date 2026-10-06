import { createResizableInspectorModel } from '@/widgets/board/model/createResizableInspectorModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useResizableInspectorModel(
  initialize: () => Parameters<typeof createResizableInspectorModel>[0],
) {
  const ref = useRef<ReturnType<typeof createResizableInspectorModel> | null>(
    null,
  )
  if (!ref.current) ref.current = createResizableInspectorModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
