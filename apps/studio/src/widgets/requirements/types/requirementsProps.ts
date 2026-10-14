import type {
  Presence,
  Profile,
  RequirementPresence,
} from '@aril/domain/collaboration'
import type { Workspace } from '@aril/domain/workspace'
export type RequirementsProps = {
  openWork: (
    link: import('@aril/domain/workspace').RequirementLink,
  ) => void
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
