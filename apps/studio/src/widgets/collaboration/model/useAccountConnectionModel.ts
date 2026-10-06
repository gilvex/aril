import { useRef, useSyncExternalStore } from 'react'
import { createAccountConnectionModel } from './createAccountConnectionModel.ts'

export function useAccountConnectionModel(
  initialize: () => Parameters<typeof createAccountConnectionModel>[0],
) {
  const ref = useRef<ReturnType<typeof createAccountConnectionModel> | null>(
    null,
  )
  if (!ref.current) ref.current = createAccountConnectionModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
