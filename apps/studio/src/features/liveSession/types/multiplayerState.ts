import type {
  Activity,
  Presence,
  Profile,
} from '@pomegranate/domain/collaboration'

export type MultiplayerState = {
  profile: Profile
  peers: Presence[]
  activity: Activity[]
  connected: boolean
  clientId: `${string}-${string}-${string}-${string}-${string}`
}
