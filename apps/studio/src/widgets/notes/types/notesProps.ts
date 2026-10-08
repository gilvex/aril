import type { Workspace } from '@pomegranate/domain/workspace'
import type { Presence, Profile } from '@pomegranate/domain/collaboration'
export type NotesProps = {
  changeText: (
    id: string,
    before: import('@pomegranate/domain/noteText').NoteTextState,
    after: import('@pomegranate/domain/noteText').NoteTextState,
  ) => void
  noteText: import('@pomegranate/domain/noteText').NoteTextChannel
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
