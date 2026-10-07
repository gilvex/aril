import type { RecoveryDraft as Recovery } from '@pomegranate/domain/freshness'
import type { StudioRoute } from '@/shared/types/studioRoute.ts'
import type { Profile } from '@pomegranate/domain/collaboration'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { Envelope, Workspace } from '@pomegranate/domain/workspace'

export type AppState = {
  sessions: import('./openWorkspaceSession.ts').OpenWorkspaceSession[]
  startupRoute: StudioRoute
  restoringRoute: boolean
  routeNotice: string
  profile: Profile | null
  studio: StudioSummary | null
  initial: Envelope | null
  recovery: Recovery | undefined
  legacy: Workspace | null
  staleDraftKey: string | null
  googleLinked: boolean
  inviteRequired: boolean
  token: string
  name: string
  busy: boolean
  error: string
}
