import * as Y from 'yjs'
import { createNoteText } from './createNoteText.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
export function mapNoteSelection(
  before: NoteTextState,
  after: NoteTextState,
  start: number,
  end: number,
): [number, number] {
  const from = createNoteText(before),
    to = createNoteText(after)
  try {
    const text = from.getText('body')
    const map = (offset: number) =>
      Y.createAbsolutePositionFromRelativePosition(
        Y.createRelativePositionFromTypeIndex(
          text,
          Math.min(text.length, offset),
        ),
        to,
      )?.index || 0
    return [map(start), map(end)]
  } finally {
    from.destroy()
    to.destroy()
  }
}
