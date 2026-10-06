import type {
  Activity,
  Presence,
  Profile,
} from '@pomegranate/domain/collaboration'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { Envelope } from '@pomegranate/domain/workspace'

export type DemoState = {
  profile: Profile
  studio: StudioSummary
  envelope: Envelope
  history: Envelope[]
  activity: Activity[]
  presence: Partial<Presence>
}
