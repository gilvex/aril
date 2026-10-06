import type { Workspace } from '@pomegranate/domain/workspace'
import type { Presence } from '@pomegranate/domain/collaboration'
export type NotesProps = {
  workspace: Workspace
  workspaceId: string
  profileId: string
  change: (fn: (w: Workspace) => Workspace) => void
  peers: Presence[]
  followed: Presence | null
  sendPresence: (changes: { selected: string[] }, force?: boolean) => void
}
