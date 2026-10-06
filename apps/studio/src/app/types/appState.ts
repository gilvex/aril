import type { Recovery } from '@/entities/workspace/index.ts'
import type { StudioRoute } from '@/shared/types/studioRoute.ts'
import type { Profile } from '@pomegranate/domain/collaboration'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { Envelope, Workspace } from '@pomegranate/domain/workspace'

export type AppState = {
  startupRoute: StudioRoute
  restoringRoute: boolean
  routeNotice: string
  profile: Profile | null
  studio: StudioSummary | null
  initial: Envelope | null
  recovery: Recovery | undefined
  legacy: Workspace | null
  staleDraftKey: string | null
  inviteRequired: boolean
  token: string
  name: string
  busy: boolean
  error: string
}
