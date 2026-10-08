import type { NoteEditorProps } from './noteEditorProps.ts'
import type { useNoteEditor } from '../model/useNoteEditor.ts'
export type NoteSurfaceProps = Pick<NoteEditorProps, 'model' | 'peers'> & {
  editor: ReturnType<typeof useNoteEditor>
  surface: 'edit' | 'read'
}
