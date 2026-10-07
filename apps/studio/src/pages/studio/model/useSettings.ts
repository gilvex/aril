import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { StudioSummary } from '@pomegranate/domain/studios'
import { createSettingsModel } from './createSettingsModel.ts'
export function useSettings(studio: StudioSummary, active: boolean) {
  const ref = useRef<ReturnType<typeof createSettingsModel> | null>(null)
  if (!ref.current) ref.current = createSettingsModel(studio.id, studio.role)
  const model = ref.current
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
  )
  useEffect(() => {
    if (active) return model.start()
  }, [active, model])
  return {
    ...state,
    set: model.set,
    load: model.load,
    changeMember: model.changeMember,
  }
}
