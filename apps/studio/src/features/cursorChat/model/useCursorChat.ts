import {
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react'
import { configureStore } from '@reduxjs/toolkit'
import { cursorChatSlice } from './slices/cursorChatSlice.ts'
import type { CursorChatProps } from '../types/cursorChatProps.ts'
export function useCursorChat({
  active,
  scope,
  sendPresence,
}: CursorChatProps) {
  const model = useMemo(() => {
    const store = configureStore({
      reducer: cursorChatSlice.reducer,
      devTools: false,
    })
    return {
      store,
      patch: (patch: Partial<ReturnType<typeof store.getState>>) => {
        store.dispatch(cursorChatSlice.actions.patch(patch))
      },
    }
  }, [])
  const state = useSyncExternalStore(
    model.store.subscribe,
    model.store.getState,
  )
  const pointer = useRef({ x: 100, y: 100 })
  const expiry = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const open = useCallback(
    () =>
      model.patch({
        open: true,
        text: '',
        x: Math.max(8, Math.min(innerWidth - 290, pointer.current.x + 16)),
        y: Math.max(8, Math.min(innerHeight - 90, pointer.current.y + 20)),
      }),
    [model],
  )
  const clear = useCallback(() => {
    clearTimeout(expiry.current)
    sendPresence({ chat: null }, true)
  }, [sendPresence])
  const publish = useCallback(
    (text: string) => {
      clearTimeout(expiry.current)
      model.patch({ expiresAt: Date.now() + 6000 })
      sendPresence(
        { chat: text.trim() ? { text, expiresAt: Date.now() + 6000 } : null },
        true,
      )
      expiry.current = setTimeout(
        () => sendPresence({ chat: null }, true),
        6000,
      )
    },
    [sendPresence, model],
  )
  const change = useCallback(
    (text: string) => {
      model.patch({ text })
      publish(text)
    },
    [model, publish],
  )
  const key = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      event.stopPropagation()
      if (event.nativeEvent.isComposing) return
      if (event.key === 'Escape') {
        clear()
        model.patch({ open: false, text: '' })
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        publish(state.text)
        model.patch({ open: false })
      }
    },
    [clear, model, publish, state.text],
  )
  useEffect(() => {
    model.patch({ open: false, text: '' })
    clear()
    if (!active) return
    const move = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY }
      const current = model.store.getState()
      if (!current.open && current.text && current.expiresAt > Date.now())
        model.patch({
          x: Math.max(8, Math.min(innerWidth - 270, event.clientX + 16)),
          y: Math.max(8, Math.min(innerHeight - 90, event.clientY + 20)),
        })
    }
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if (
        event.key !== '/' ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.repeat ||
        event.isComposing
      )
        return
      const target = event.target as HTMLElement
      if (
        target.closest(
          'input,textarea,select,[contenteditable="true"],[role="dialog"]',
        )
      )
        return
      event.preventDefault()
      open()
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('keydown', shortcut)
    return () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('keydown', shortcut)
      clear()
    }
  }, [active, scope, model, open, clear])
  return {
    ...state,
    openComposer: open,
    close: () => model.patch({ open: false }),
    change,
    key,
  }
}
