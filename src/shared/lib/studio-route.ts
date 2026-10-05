export type StudioView = 'canvas' | 'requirements' | 'design' | 'notes'
export type StudioRoute = {
  workspaceId: string
  boardId?: string
  view: StudioView
  canvasMode: 'canvas' | 'wireframes'
  requirementId?: string
}

const routeKeys = ['workspace', 'board', 'view', 'canvas', 'requirement']

export function readStudioRoute(search: string): StudioRoute {
  const params = new URLSearchParams(search)
  const view = params.get('view')
  return {
    workspaceId: params.get('workspace') || '',
    boardId: params.get('board') || undefined,
    view:
      view === 'requirements' || view === 'design' || view === 'notes'
        ? view
        : 'canvas',
    canvasMode: params.get('canvas') === 'wireframes' ? 'wireframes' : 'canvas',
    requirementId: params.get('requirement') || undefined,
  }
}

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
