import { useEffect, useRef, useSyncExternalStore, useCallback } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { workspaceTabsSchema } from '../config/workspaceTabsSchema.ts'
import { workspaceTabsSlice } from './slices/workspaceTabsSlice.ts'
import type { StudioSummary } from '@pomegranate/domain/studios'
export function useWorkspaceTabs(
  studio: StudioSummary,
  profileId: string,
  active = true,
) {
  const key = `aril:workspaceTabs:${profileId}`
  const ref = useRef<ReturnType<typeof initialize> | null>(null)
  function initialize() {
    let tabs: StudioSummary[] = []
    try {
      tabs = workspaceTabsSchema.parse(
        JSON.parse(sessionStorage.getItem(key) || '[]'),
      )
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
    if (!active) return
    // Other cached editors may have opened or closed tabs while this one slept.
    try {
      const saved = workspaceTabsSchema.parse(
        JSON.parse(sessionStorage.getItem(key) || '[]'),
      )
      for (const tab of store.getState().tabs)
        store.dispatch(workspaceTabsSlice.actions.closed(tab.id))
      for (const tab of saved)
        store.dispatch(workspaceTabsSlice.actions.opened(tab))
    } catch {
      /* Keep in-memory tabs if storage is unavailable. */
    }
    store.dispatch(workspaceTabsSlice.actions.opened(studio))
  }, [active, key, store, studio])
  useEffect(() => {
    if (!active) return
    try {
      sessionStorage.setItem(key, JSON.stringify(store.getState().tabs))
    } catch {
      /* Tabs still work in memory. */
    }
  }, [active, key, state.tabs, store])
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
