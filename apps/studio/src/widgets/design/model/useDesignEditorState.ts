import { configureStore } from '@reduxjs/toolkit'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useCompactLayout } from '@/shared/model/index.ts'
import { designEditorSlice } from './slices/designEditorSlice.ts'
import type { DesignEditorState } from '../types/designEditorState.ts'
import { createDesignEditorState } from './createDesignEditorState.ts'
import { readDesignPanelLayout } from '../utils/readDesignPanelLayout.ts'
import { designPanelPreference } from '../utils/designPanelPreference.ts'
export function useDesignEditorState(workspaceId: string) {
  const compact = useCompactLayout()
  const ref = useRef<{
    store: ReturnType<typeof initialize>
    patch: (value: Partial<DesignEditorState>) => void
  } | null>(null)
  function initialize() {
    const initial = createDesignEditorState()
    initial.compact = compact
    try {
      Object.assign(
        initial,
        readDesignPanelLayout(
          localStorage.getItem('aril:designPanelLayout:v1'),
        ),
      )
      initial.pageId =
        sessionStorage.getItem(`aril:designPage:${workspaceId}`) ||
        initial.pageId
    } catch {
      /* Storage can be unavailable in private browsers. */
    }
    return configureStore({
      reducer: designEditorSlice.reducer,
      preloadedState: initial,
      devTools: false,
      middleware: (defaults) => defaults({ thunk: false }),
    })
  }
  if (!ref.current) {
    const store = initialize()
    ref.current = {
      store,
      patch: (value) => {
        store.dispatch(designEditorSlice.actions.patch(value))
      },
    }
  }
  const { store, patch } = ref.current
  useEffect(() => {
    let previous = JSON.stringify(designPanelPreference(store.getState()))
    let timer: ReturnType<typeof setTimeout> | undefined
    const save = () => {
      try {
        localStorage.setItem('aril:designPanelLayout:v1', previous)
      } catch {
        /* Layout preferences are optional. */
      }
    }
    const unsubscribe = store.subscribe(() => {
      const next = JSON.stringify(designPanelPreference(store.getState()))
      if (next === previous) return
      previous = next
      clearTimeout(timer)
      timer = setTimeout(save, 200)
    })
    return () => {
      unsubscribe()
      if (timer) {
        clearTimeout(timer)
        save()
      }
    }
  }, [store])
  useEffect(() => patch({ compact }), [compact, patch])
  const state = useSyncExternalStore(store.subscribe, store.getState)
  return { ...state, patch }
}
