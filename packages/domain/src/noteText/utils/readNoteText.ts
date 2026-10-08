import { createNoteText } from './createNoteText.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
export function readNoteText(state: NoteTextState): string {
  const doc = createNoteText(state)
  try {
    return doc.getText('body').toString()
  } finally {
    doc.destroy()
  }
}
