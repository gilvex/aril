import * as Y from 'yjs'
import { decode64 } from '../../liveSession/utils/decode64.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
export function createNoteText(state: NoteTextState): Y.Doc {
  const doc = new Y.Doc()
  const client = doc.clientID
  doc.clientID = 1
  if (state.seed) doc.getText('body').insert(0, state.seed)
  doc.clientID = client
  try {
    if (state.seed.length > 50000 || state.update.length > 1000000)
      throw new Error('Note exceeds text limit')
    if (state.update) Y.applyUpdate(doc, decode64(state.update))
    if (doc.getText('body').length > 50000) {
      throw new Error('Note exceeds text limit')
    }
    return doc
  } catch (error) {
    doc.destroy()
    throw error
  }
}
