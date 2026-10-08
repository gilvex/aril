import { useCallback, useEffect, useRef } from 'react'
import type { PointerEvent } from 'react'
import type { NoteSurfaceProps } from '../types/noteSurfaceProps.ts'
import { noteBodyKey } from '../utils/noteBodyKey.ts'
import { readNoteSelection } from '../utils/readNoteSelection.ts'
import { drawNotePresence } from '../utils/drawNotePresence.ts'

export function useNoteSurface({
  model,
  editor,
  peers,
  surface,
}: NoteSurfaceProps) {
  const lastPointer = useRef<{ x: number; y: number } | null>(null)
  const overlay = useRef<HTMLDivElement>(null)
  const mirror = useRef<HTMLDivElement>(null)
  const { note, sendPresence, patch } = model
  const elementRef = surface === 'edit' ? editor.editor : editor.reader
  const publish = useCallback(
    (event?: PointerEvent<HTMLElement>) => {
      const element = elementRef.current
      if (!element) return
      const selection = readNoteSelection(element)
      const bounds = element.getBoundingClientRect()
      if (event)
        lastPointer.current = {
          x: Math.max(
            0,
            Math.min(1, (event.clientX - bounds.left) / element.clientWidth),
          ),
          y: Math.max(
            0,
            Math.min(
              1,
              (event.clientY - bounds.top + element.scrollTop) /
                element.scrollHeight,
            ),
          ),
        }
      sendPresence({
        note: {
          id: note.id,
          bodyKey: noteBodyKey(note.body),
          surface,
          selection,
          pointer: lastPointer.current,
        },
      })
    },
    [elementRef, note.id, note.body, sendPresence, surface],
  )
  const select = useCallback(() => {
    publish()
    const element = elementRef.current
    const selection = element ? readNoteSelection(element) : null
    if (selection) patch({ commentQuote: selection.quote })
  }, [elementRef, patch, publish])
  const clear = useCallback(() => sendPresence({ note: null }), [sendPresence])
  useEffect(() => {
    const selectionChanged = () => {
      const element = elementRef.current
      if (
        surface === 'read' &&
        element?.contains(window.getSelection()?.anchorNode || null)
      )
        select()
    }
    window.addEventListener('blur', clear)
    document.addEventListener('selectionchange', selectionChanged)
    return () => {
      window.removeEventListener('blur', clear)
      document.removeEventListener('selectionchange', selectionChanged)
    }
  }, [clear, elementRef, select, surface])
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    const draw = () => {
      if (overlay.current)
        drawNotePresence(
          overlay.current,
          element,
          mirror.current,
          peers,
          note.id,
          note.body,
        )
    }
    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(element)
    element.addEventListener('scroll', draw)
    const timer = window.setInterval(draw, 1000)
    return () => {
      observer.disconnect()
      element.removeEventListener('scroll', draw)
      clearInterval(timer)
    }
  }, [elementRef, peers, note.id, note.body])
  useEffect(() => clear, [clear])
  return { overlay, mirror, publish, select, clear }
}
