import type { Workspace } from '@aril/domain/workspace'
import type { Presence, Profile } from '@aril/domain/collaboration'
export type NotesProps = {
  changeText: (
    id: string,
    before: import('@aril/domain/noteText').NoteTextState,
    after: import('@aril/domain/noteText').NoteTextState,
  ) => void
  noteText: import('@aril/domain/noteText').NoteTextChannel
  workspace: Workspace
  workspaceId: string
  profile: Profile
  change: (fn: (w: Workspace) => Workspace) => void
  peers: Presence[]
  followed: Presence | null
  sendPresence: (
    changes: Partial<Pick<Presence, 'selected' | 'note' | 'chat'>>,
    force?: boolean,
  ) => void
}
