import { routeKeys } from '@/shared/config/routeKeys.ts'
import type { StudioRoute } from '@/shared/types/studioRoute.ts'
export function studioRouteUrl(href: string, route: StudioRoute | null) {
  const url = new URL(href)
  for (const key of routeKeys) url.searchParams.delete(key)
  if (route) {
    url.searchParams.set('workspace', route.workspaceId)
    if (route.boardId) url.searchParams.set('board', route.boardId)
    url.searchParams.set('view', route.view)
    if (route.canvasMode === 'wireframes')
      url.searchParams.set('canvas', 'wireframes')
    if (route.view === 'requirements' && route.requirementId)
      url.searchParams.set('requirement', route.requirementId)
  }
  return url.pathname + url.search + url.hash
}
