import type { Workspace } from '@pomegranate/domain/workspace'
import type { Presence } from '@pomegranate/domain/collaboration'
import type { useNotesModel } from '../model/useNotesModel.ts'
export type NoteEditorProps = {
  model: ReturnType<typeof useNotesModel>
  workspace: Workspace
  workspaceId: string
  peers: Presence[]
}
