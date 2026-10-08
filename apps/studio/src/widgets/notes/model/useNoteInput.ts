import { useCallback } from 'react'
import type { ChangeEvent, CompositionEvent } from 'react'
import type { NoteSurfaceProps } from '../types/noteSurfaceProps.ts'
export function useNoteInput(
  { model }: NoteSurfaceProps,
  beforeInput: () => void,
) {
  const { getState, patch, note, textState, editBody } = model
  const compositionStart = useCallback(
    (event: CompositionEvent<HTMLTextAreaElement>) => {
      patch({
        composition: {
          id: note.id,
          body: event.currentTarget.value,
          base: getState().liveText[note.id] || textState,
        },
      })
    },
    [patch, note.id, getState, textState],
  )
  const compositionEnd = useCallback(
    (event: CompositionEvent<HTMLTextAreaElement>) => {
      const composition = getState().composition
      if (composition?.id !== note.id) return
      beforeInput()
      editBody(event.currentTarget.value, composition.base)
      patch({ composition: null })
    },
    [getState, note.id, beforeInput, editBody, patch],
  )
  const change = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      const composition = getState().composition
      if (composition?.id === note.id) {
        patch({ composition: { ...composition, body: event.target.value } })
        return
      }
      beforeInput()
      editBody(event.target.value)
    },
    [getState, note.id, patch, beforeInput, editBody],
  )
  return {
    compositionStart,
    compositionEnd,
    change,
    value:
      model.state.composition?.id === note.id
        ? model.state.composition.body
        : note.body,
  }
}
