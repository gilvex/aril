import { useCallback, useRef, useSyncExternalStore } from 'react'
import type { StudioSummary } from '@aril/domain/studios'
import { createWorkspaceManagementModel } from './createWorkspaceManagementModel.ts'
export function useWorkspaceManagement() {
  const ref = useRef<ReturnType<typeof createWorkspaceManagementModel> | null>(
    null,
  )
  if (!ref.current) ref.current = createWorkspaceManagementModel()
  const model = ref.current
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
  )
  const manage = useCallback(
    (studio: StudioSummary, mode: 'rename' | 'delete') => {
      if (!model.store.getState().busy)
        model.set({
          management: { studio, mode },
          name: mode === 'rename' ? studio.name : '',
          error: '',
        })
    },
    [model],
  )
  const close = useCallback(() => {
    if (!model.store.getState().busy) model.set({ management: null })
  }, [model])
  const setName = useCallback((name: string) => model.set({ name }), [model])
  return { ...state, manage, close, setName, save: model.save }
}
