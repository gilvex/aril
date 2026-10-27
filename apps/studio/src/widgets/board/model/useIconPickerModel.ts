import { useRef, useSyncExternalStore } from 'react'
import { createIconPickerModel } from './createIconPickerModel.ts'
export function useIconPickerModel() {
  const ref = useRef<ReturnType<typeof createIconPickerModel> | null>(null)
  if (!ref.current) ref.current = createIconPickerModel()
  const model = ref.current
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
  )
  return { ...state, ...model.actions }
}
