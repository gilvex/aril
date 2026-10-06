import type { Recovery } from '@/entities/workspace/index.ts'
import type { StudioRoute } from '@/shared/types/studioRoute.ts'
import { readStudioRoute } from '@/shared/utils/readStudioRoute.ts'
import type { Profile } from '@pomegranate/domain/collaboration'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { Envelope, Workspace } from '@pomegranate/domain/workspace'
export function createAppState() {
  const startupRoute: StudioRoute = (() => readStudioRoute(location.search))()
  const restoringRoute: boolean = !!startupRoute.workspaceId
  const routeNotice: string = ''
  const profile: Profile | null = null
  const studio: StudioSummary | null = null
  const initial: Envelope | null = null
  const recovery: Recovery | undefined = undefined
  const legacy: Workspace | null = null
  const staleDraftKey: string | null = null
  const inviteRequired: boolean = false
  const token: string = (() =>
    new URLSearchParams(location.hash.slice(1)).get('invite') || '')()
  const name: string = ''
  const busy: boolean = false
  const error: string = ''
  return {
    startupRoute,
    restoringRoute,
    routeNotice,
    profile,
    studio,
    initial,
    recovery,
    legacy,
    staleDraftKey,
    inviteRequired,
    token,
    name,
    busy,
    error,
  }
}
