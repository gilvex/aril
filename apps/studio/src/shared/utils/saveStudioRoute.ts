import type { StudioRoute } from '../types/studioRoute.ts'
import { studioRouteUrl } from './studioRouteUrl.ts'

export function saveStudioRoute(route: StudioRoute | null) {
  const next = studioRouteUrl(location.href, route)
  if (next !== location.pathname + location.search + location.hash)
    history.replaceState(history.state, '', next)
}
