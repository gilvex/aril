import type { Workspace } from '@pomegranate/domain/workspace'
import type { Presence, Profile } from '@pomegranate/domain/collaboration'
export type NotesProps = {
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
