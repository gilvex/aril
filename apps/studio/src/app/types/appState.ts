import type { RecoveryDraft as Recovery } from '@aril/domain/freshness'
import type { StudioRoute } from '@/shared/types/studioRoute.ts'
import type { Profile } from '@aril/domain/collaboration'
import type { StudioSummary } from '@aril/domain/studios'
import type { Envelope, Workspace } from '@aril/domain/workspace'

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
  accountLinked: boolean
  inviteRequired: boolean
  token: string
  name: string
  busy: boolean
  error: string
}
