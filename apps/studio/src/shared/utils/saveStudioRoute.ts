import type { StudioRoute } from '@/shared/types/studioRoute.ts'
import { studioRouteUrl } from '@/shared/utils/studioRouteUrl.ts'

export function saveStudioRoute(route: StudioRoute | null) {
  const next = studioRouteUrl(location.href, route)
  if (next !== location.pathname + location.search + location.hash)
    history.replaceState(history.state, '', next)
  if (route) {
    try {
      sessionStorage.setItem(
        `aril:workspaceRoute:${route.workspaceId}`,
        location.pathname + location.search,
      )
    } catch {
      /* Optional tab preference. */
    }
  }
}
