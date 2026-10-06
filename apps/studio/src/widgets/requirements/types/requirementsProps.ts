import type {
  Presence,
  Profile,
  RequirementPresence,
} from '@pomegranate/domain/collaboration'
import type { Workspace } from '@pomegranate/domain/workspace'
export type RequirementsProps = {
  workspaceId: string
  workspace: Workspace
  change: (fn: (w: Workspace) => Workspace) => void
  selected: string | null
  onSelect: (id: string | null) => void
  openBoard: (id: string) => void
  profile: Profile
  peers: Presence[]
  sendPresence: (
    changes: { requirement: RequirementPresence | null },
    force?: boolean,
  ) => void
}
