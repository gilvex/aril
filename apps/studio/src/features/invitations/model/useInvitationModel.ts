import { useRef, useSyncExternalStore } from 'react'
import { createInvitationModel } from './createInvitationModel.ts'
export function useInvitationModel() {
  const ref = useRef<ReturnType<typeof createInvitationModel> | null>(null)
  if (!ref.current) ref.current = createInvitationModel()
  const model = ref.current
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
  )
  return { ...state, ...model }
}
