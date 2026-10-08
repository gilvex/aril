import * as Y from 'yjs'
import { createNoteText } from './createNoteText.ts'
import { encodeNoteUpdate } from './encodeNoteUpdate.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
export function noteTextVector(state: NoteTextState): string {
  const doc = createNoteText(state)
  try {
    return encodeNoteUpdate(Y.encodeStateVector(doc))
  } finally {
    doc.destroy()
  }
}
