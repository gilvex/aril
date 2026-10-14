import type {
  Activity,
  Presence,
  Profile,
} from '@aril/domain/collaboration'
import type { StudioSummary } from '@aril/domain/studios'
import type { Envelope } from '@aril/domain/workspace'
import type { DemoAction } from './demoAction.ts'
import type { DemoPlanner } from './demoPlanner.ts'

export type DemoState = {
  profile: Profile
  studio: StudioSummary
  envelope: Envelope
  history: Envelope[]
  activity: Activity[]
  presence: Partial<Presence>
  actions: DemoAction[]
  completedActions: string[]
  activeAction: DemoAction | null
  planner: DemoPlanner
}
