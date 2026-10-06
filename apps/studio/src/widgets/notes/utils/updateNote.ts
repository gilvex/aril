import type { Workspace } from '@pomegranate/domain/workspace'
import type { NoteDocument } from '../types/noteDocument.ts'
export function updateNote(
  workspace: Workspace,
  id: string,
  patch: Partial<Pick<NoteDocument, 'title' | 'body'>>,
) {
  if (id === 'project-notes')
    return {
      ...workspace,
      ...(patch.title === undefined
        ? {}
        : { notesTitle: patch.title || 'Untitled' }),
      ...(patch.body === undefined ? {} : { notes: patch.body }),
    }
  return {
    ...workspace,
    documents: workspace.documents?.map((note) =>
      note.id === id
        ? {
            ...note,
            ...patch,
            title:
              patch.title === undefined
                ? note.title
                : patch.title || 'Untitled',
          }
        : note,
    ),
  }
}
