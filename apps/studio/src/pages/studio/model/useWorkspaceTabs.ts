import { useEffect, useRef, useSyncExternalStore, useCallback } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { z } from 'zod'
import { workspaceTabsSlice } from './slices/workspaceTabsSlice.ts'
import type { StudioSummary } from '@pomegranate/domain/studios'
export function useWorkspaceTabs(studio: StudioSummary, profileId: string) {
  const key = `aril:workspaceTabs:${profileId}`
  const ref = useRef<ReturnType<typeof initialize> | null>(null)
  function initialize() {
    let tabs: StudioSummary[] = []
    try {
      tabs = z
        .array(
          z.object({
            id: z.string().min(1).max(100),
            name: z.string().max(120),
            createdAt: z.string(),
            role: z.enum(['owner', 'member', 'guest']),
          }),
        )
        .max(100)
        .parse(JSON.parse(sessionStorage.getItem(key) || '[]'))
    } catch {
      /* Invalid or unavailable local tab preferences. */
    }
    const store = configureStore({
      reducer: workspaceTabsSlice.reducer,
      preloadedState: { tabs },
      devTools: false,
    })
    store.dispatch(workspaceTabsSlice.actions.opened(studio))
    return store
  }
  if (!ref.current) ref.current = initialize()
  const store = ref.current
  const state = useSyncExternalStore(store.subscribe, store.getState)
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state.tabs))
    } catch {
      /* Tabs still work in memory. */
    }
  }, [key, state.tabs])
  const close = useCallback(
    (id: string) => {
      store.dispatch(workspaceTabsSlice.actions.closed(id))
      // Persist before navigation unmounts this workspace.
      try {
        sessionStorage.setItem(key, JSON.stringify(store.getState().tabs))
      } catch {
        /* Optional preference. */
      }
    },
    [key, store],
  )
  return { tabs: state.tabs, close }
}
