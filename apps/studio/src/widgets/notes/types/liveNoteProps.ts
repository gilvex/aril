import type { NotesProps } from './notesProps.ts'
import type { NotesState } from './notesState.ts'
import type { NoteDocument } from './noteDocument.ts'
export type LiveNoteProps = Pick<
  NotesProps,
  'workspace' | 'changeText' | 'noteText'
> & {
  note: NoteDocument
  canEdit: boolean
  patch: (state: Partial<NotesState>) => void
  getState: () => NotesState
}
