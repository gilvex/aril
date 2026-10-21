import { useRef, useSyncExternalStore } from 'react'
import { createInvitationModel } from './createInvitationModel.ts'
import type { InvitationState } from '../types/index.ts'
export function useInvitationModel(initial?: Partial<InvitationState>) {
  const ref = useRef<ReturnType<typeof createInvitationModel> | null>(null)
  if (!ref.current) ref.current = createInvitationModel(initial)
  const model = ref.current
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
  )
  return { ...state, ...model }
}
