import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import { createAccountActionsModel } from './createAccountActionsModel.ts'
import { accountActionsSlice } from './slices/accountActionsSlice.ts'
import type { AccountActionsProps } from '../types/accountActionsProps.ts'

export function useAccountActions({ beforeLeave }: AccountActionsProps) {
  const guard = useRef(beforeLeave)
  useEffect(() => {
    guard.current = beforeLeave
  }, [beforeLeave])
  const ref = useRef<ReturnType<typeof createAccountActionsModel> | null>(null)
  if (!ref.current)
    ref.current = createAccountActionsModel(async () =>
      guard.current ? guard.current() : true,
    )
  const model = ref.current
  useEffect(() => {
    const task = model.start()
    return () => task.cancel()
  }, [model])
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
  )
  const switchAccount = useCallback(
    () =>
      model.store.dispatch(
        accountActionsSlice.actions.requested({ mode: 'switch' }),
      ),
    [model],
  )
  const logout = useCallback(
    () =>
      model.store.dispatch(
        accountActionsSlice.actions.requested({ mode: 'logout' }),
      ),
    [model],
  )
  const cancel = useCallback(
    () => model.store.dispatch(accountActionsSlice.actions.cancel()),
    [model],
  )
  const confirm = useCallback(() => {
    if (state.confirmation)
      model.store.dispatch(
        accountActionsSlice.actions.requested({
          mode: state.confirmation,
          confirmed: true,
        }),
      )
  }, [model, state.confirmation])
  return { ...state, switchAccount, logout, cancel, confirm }
}
