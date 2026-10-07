import { configureStore } from '@reduxjs/toolkit'
import { useRef, useSyncExternalStore, useEffect } from 'react'
import { designEditorSlice } from './slices/designEditorSlice.ts'
import type { DesignEditorState } from '../types/designEditorState.ts'
import { createDesignEditorState } from './createDesignEditorState.ts'
export function useDesignEditorState(compact: boolean, workspaceId: string) {
  const ref = useRef<{
    store: ReturnType<typeof initialize>
    patch: (value: Partial<DesignEditorState>) => void
  } | null>(null)
  function initialize() {
    const initial = { ...createDesignEditorState(), layers: !compact }
    try {
      const height = Number(sessionStorage.getItem('aril:designPagesHeight'))
      if (Number.isFinite(height) && height >= 72 && height <= 800)
        initial.pagesHeight = height
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
  const state = useSyncExternalStore(store.subscribe, store.getState)
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'aril:designPagesHeight',
        String(state.pagesHeight),
      )
    } catch {
      /* Optional preference. */
    }
  }, [state.pagesHeight])
  return { ...state, patch }
}
