import * as Y from 'yjs'
import { decode64 } from '../../liveSession/utils/decode64.ts'
import { encodeNoteUpdate } from './encodeNoteUpdate.ts'
import { createNoteText } from './createNoteText.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
export function mergeNoteText(
  left: NoteTextState,
  right: NoteTextState,
): NoteTextState {
  if (left.seed !== right.seed)
    throw new Error('Note base changed; reload the latest saved note')
  const update = encodeNoteUpdate(
    Y.mergeUpdates([
      left.update ? decode64(left.update) : new Uint8Array([0, 0]),
      right.update ? decode64(right.update) : new Uint8Array([0, 0]),
    ]),
  )
  const merged = { seed: left.seed, update }
  const doc = createNoteText(merged)
  doc.destroy()
  return merged
}
