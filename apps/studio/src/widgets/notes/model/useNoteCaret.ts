import { useCallback, useLayoutEffect, useRef } from 'react'
import {
  mapNoteSelection,
  type NoteTextState,
} from '@pomegranate/domain/noteText'
import type { NoteSurfaceProps } from '../types/noteSurfaceProps.ts'
export function useNoteCaret({ editor, model, surface }: NoteSurfaceProps) {
  const anchor = useRef<{
    state: NoteTextState
    start: number
    end: number
  } | null>(null)
  const localInput = useRef(false)
  const { getState, textState, note } = model
  const composing = model.state.composition?.id === note.id
  const capture = useCallback(() => {
    const element = editor.editor.current
    if (surface !== 'edit' || getState().composition) return
    const state = getState().liveText[note.id] || textState
    if (element && document.activeElement === element)
      anchor.current = {
        state,
        start: element.selectionStart,
        end: element.selectionEnd,
      }
  }, [editor.editor, surface, getState, note.id, textState])
  const beforeInput = useCallback(() => {
    localInput.current = true
  }, [])
  useLayoutEffect(() => {
    const element = editor.editor.current
    if (
      surface !== 'edit' ||
      composing ||
      !element ||
      document.activeElement !== element
    )
      return
    if (anchor.current && !localInput.current) {
      const { state, start, end } = anchor.current
      if (state.seed === textState.seed) {
        const [a, b] = mapNoteSelection(state, textState, start, end)
        element.setSelectionRange(a, b)
      }
    }
    localInput.current = false
    capture()
  }, [editor.editor, surface, composing, textState, capture])
  return { capture, beforeInput }
}
