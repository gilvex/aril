import { useMemo, useEffect, useSyncExternalStore } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { request } from '@/shared/api/request.ts'
import type { StudioSummary } from '@pomegranate/domain/studios'
import { workspacePickerSlice } from './slices/workspacePickerSlice.ts'
export function useWorkspacePicker(current: StudioSummary) {
  const model = useMemo(() => {
    const store = configureStore({
      reducer: workspacePickerSlice.reducer,
      devTools: false,
    })
    return {
      store,
      patch: (patch: Partial<ReturnType<typeof store.getState>>) => {
        store.dispatch(workspacePickerSlice.actions.patch(patch))
      },
    }
  }, [])
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
  )
  useEffect(() => {
    const controller = new AbortController()
    if (current.id === 'demo') {
      model.patch({ items: [current], loading: false })
      return
    }
    request<StudioSummary[]>('/api/studios', { signal: controller.signal })
      .then((items) => model.patch({ items, loading: false }))
      .catch(() => {
        if (!controller.signal.aborted)
          model.patch({ loading: false, error: 'Could not load workspaces.' })
      })
    return () => controller.abort()
  }, [current, model])
  return { ...state, patch: model.patch }
}
