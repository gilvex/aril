import { createGoogleSignInModel } from '@/features/googleSignIn/model/createGoogleSignInModel.ts'
import { useRef, useSyncExternalStore } from 'react'

export function useGoogleSignInModel(
  initialize: () => Parameters<typeof createGoogleSignInModel>[0],
) {
  const ref = useRef<ReturnType<typeof createGoogleSignInModel> | null>(null)
  if (!ref.current) ref.current = createGoogleSignInModel(initialize())
  const model = ref.current
  const state = useSyncExternalStore(model.store.subscribe, model.getSnapshot)
  return { ...state, ...model.actions }
}
