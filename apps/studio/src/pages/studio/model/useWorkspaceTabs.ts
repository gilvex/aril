import { request } from '@/shared/api/request.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import { syncWorkspaceTabs } from '@/shared/utils/syncWorkspaceTabs.ts'
import { useEffect, useRef, useSyncExternalStore, useCallback } from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { workspaceTabsSchema } from '../config/workspaceTabsSchema.ts'
import { workspaceTabsSlice } from './slices/workspaceTabsSlice.ts'
import type { StudioSummary } from '@aril/domain/studios'
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
  useEffect(() => {
    if (!active || isDemoMode()) return
    const controller = new AbortController()
    let pending = false
    const refresh = () => {
      if (pending || document.visibilityState === 'hidden') return
      pending = true
      void request<StudioSummary[]>('/api/studios', {
        signal: controller.signal,
      })
        .then((available) => {
          if (controller.signal.aborted) return
          const tabs = syncWorkspaceTabs(profileId, available)
          if (tabs) store.dispatch(workspaceTabsSlice.actions.replaced(tabs))
        })
        .catch(() => {
          /* Offline is not evidence that a workspace was deleted. */
        })
        .finally(() => {
          pending = false
        })
    }
    refresh()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    const timer = window.setInterval(refresh, 30000)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [active, profileId, store])
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
