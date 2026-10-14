import type { Workspace } from '@aril/domain/workspace'
import type { Presence } from '@aril/domain/collaboration'
import type { useNotesModel } from '../model/useNotesModel.ts'
export type NoteEditorProps = {
  model: ReturnType<typeof useNotesModel>
  workspace: Workspace
  workspaceId: string
  peers: Presence[]
}
