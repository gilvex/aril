import type { NoteTextState } from '../types/noteTextState.ts'
import { mergeNoteText } from './mergeNoteText.ts'
import { readNoteText } from './readNoteText.ts'
export function isNoteTextUndo(
  before: NoteTextState,
  after: NoteTextState,
): boolean {
  return (
    readNoteText(before) !== readNoteText(after) &&
    readNoteText(mergeNoteText(before, after)) === readNoteText(before)
  )
}
