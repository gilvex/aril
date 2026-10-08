import type { Workspace } from '../../workspace/types/workspace.ts'
import type { NoteTextState } from '../types/noteTextState.ts'
import { readNoteText } from './readNoteText.ts'
export function setNoteText(
  workspace: Workspace,
  id: string,
  state: NoteTextState,
): Workspace {
  const body = readNoteText(state)
  if (
    id !== 'project-notes' &&
    !workspace.documents?.some((note) => note.id === id)
  )
    return workspace
  return {
    ...workspace,
    noteStates: { ...workspace.noteStates, [id]: state },
    ...(id === 'project-notes'
      ? { notes: body }
      : {
          documents: workspace.documents?.map((note) =>
            note.id === id ? { ...note, body } : note,
          ),
        }),
  }
}
