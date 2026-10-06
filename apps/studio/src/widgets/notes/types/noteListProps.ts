import type { Presence } from '@pomegranate/domain/collaboration'
import type { NoteDocument } from './noteDocument.ts'
import type { NotesState } from './notesState.ts'
export type NoteListProps = {
  documents: NoteDocument[]
  selected: string
  query: string
  patch: (patch: Partial<NotesState>) => void
  select: (id: string) => void
  peers: Presence[]
}
