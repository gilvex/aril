import type { Panel } from '@/widgets/collaboration/types/collaborationBarPanel.ts'
import type {
  Activity,
  Presence,
  Profile,
} from '@pomegranate/domain/collaboration'
export type CollaborationBarProps = {
  panel: Panel
  setPanel: (panel: Panel) => void
  followId: string | null
  onFollow: (id: string | null) => void
  workspaceId: string
  profile: Profile
  peers: Presence[]
  activity: Activity[]
  connected: boolean
  onProfile: (profile: Profile) => void
}
