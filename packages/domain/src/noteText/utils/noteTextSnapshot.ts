import type { Workspace } from '../../workspace/types/workspace.ts'
import { readNoteText } from './readNoteText.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
export function noteTextSnapshot(
  workspace: Workspace,
  id: string,
): NoteTextState | null {
  const body =
    id === 'project-notes'
      ? workspace.notes
      : workspace.documents?.find((note) => note.id === id)?.body
  if (body === undefined) return null
  const saved = workspace.noteStates?.[id]
  if (saved) {
    try {
      if (readNoteText(saved) === body) return saved
    } catch {
      /* Legacy import starts a new text history. */
    }
  }
  return { seed: body, update: '' }
}
