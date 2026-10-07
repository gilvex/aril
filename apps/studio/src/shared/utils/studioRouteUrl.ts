import { routeKeys } from '@/shared/config/routeKeys.ts'
import type { StudioRoute } from '@/shared/types/studioRoute.ts'
export function studioRouteUrl(href: string, route: StudioRoute | null) {
  const url = new URL(href)
  for (const key of routeKeys) url.searchParams.delete(key)
  url.pathname = '/'
  if (route) {
    url.pathname = `/w/${encodeURIComponent(route.workspaceId)}/${route.view}`
    if (route.boardId) {
      if (route.view === 'canvas')
        url.pathname += `/${encodeURIComponent(route.boardId)}`
      else url.searchParams.set('board', route.boardId)
    }
    if (route.canvasMode !== 'canvas')
      url.searchParams.set('canvas', route.canvasMode)
    if (route.view === 'requirements' && route.requirementId)
      url.searchParams.set('requirement', route.requirementId)
  }
  return url.pathname + url.search + url.hash
}
