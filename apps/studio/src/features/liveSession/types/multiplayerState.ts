import type {
  Activity,
  Presence,
  Profile,
} from '@aril/domain/collaboration'

export type MultiplayerState = {
  profile: Profile
  peers: Presence[]
  activity: Activity[]
  connected: boolean
  clientId: `${string}-${string}-${string}-${string}-${string}`
}
