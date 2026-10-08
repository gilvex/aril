import * as Y from 'yjs'
import { createNoteText } from './createNoteText.ts'
import { encodeNoteUpdate } from './encodeNoteUpdate.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
export function writeNoteText(
  state: NoteTextState,
  body: string,
): NoteTextState {
  if (body.length > 50000) throw new Error('Note exceeds text limit')
  const doc = createNoteText(state),
    base = createNoteText({ seed: state.seed, update: '' })
  try {
    const text = doc.getText('body'),
      previous = text.toString()
    let start = 0,
      suffix = 0
    while (
      start < previous.length &&
      start < body.length &&
      previous[start] === body[start]
    )
      start++
    while (
      suffix < previous.length - start &&
      suffix < body.length - start &&
      previous[previous.length - 1 - suffix] === body[body.length - 1 - suffix]
    )
      suffix++
    doc.transact(() => {
      if (previous.length - start - suffix)
        text.delete(start, previous.length - start - suffix)
      if (body.length - start - suffix)
        text.insert(start, body.slice(start, body.length - suffix))
    })
    const update = encodeNoteUpdate(
      Y.encodeStateAsUpdate(doc, Y.encodeStateVector(base)),
    )
    if (update.length > 1000000)
      throw new Error('Note exceeds collaboration history limit')
    return { seed: state.seed, update }
  } finally {
    doc.destroy()
    base.destroy()
  }
}
