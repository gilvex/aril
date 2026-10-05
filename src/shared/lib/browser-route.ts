import { studioRouteUrl, type StudioRoute } from './studio-route'
export { readStudioRoute } from './studio-route'

export function saveStudioRoute(route: StudioRoute | null) {
  const next = studioRouteUrl(location.href, route)
  if (next !== location.pathname + location.search + location.hash)
    history.replaceState(history.state, '', next)
}
