import * as Y from 'yjs'
import { createNoteText } from './createNoteText.ts'
import { encodeNoteUpdate } from './encodeNoteUpdate.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
export function noteTextDelta(
  before: NoteTextState,
  after: NoteTextState,
): string {
  if (before.seed !== after.seed) throw new Error('Note base changed')
  const from = createNoteText(before),
    to = createNoteText(after)
  try {
    return encodeNoteUpdate(
      Y.encodeStateAsUpdate(to, Y.encodeStateVector(from)),
    )
  } finally {
    from.destroy()
    to.destroy()
  }
}
