import { createDesignBoardModel } from '@/widgets/design/model/createDesignBoardModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useDesignBoardModel(
  initialize: () => Parameters<typeof createDesignBoardModel>[0],
) {
  const ref = useRef<ReturnType<typeof createDesignBoardModel> | null>(null)
  if (!ref.current) ref.current = createDesignBoardModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
