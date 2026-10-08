import * as Y from 'yjs'
import { createNoteText } from './createNoteText.ts'
import { encodeNoteUpdate } from './encodeNoteUpdate.ts'
import { decode64 } from '../../liveSession/utils/decode64.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
export function noteTextMissing(state: NoteTextState, vector: string): string {
  const doc = createNoteText(state)
  try {
    return encodeNoteUpdate(Y.encodeStateAsUpdate(doc, decode64(vector)))
  } finally {
    doc.destroy()
  }
}
