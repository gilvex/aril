import type { StudioRoute } from '@/shared/types/studioRoute.ts'
export function readStudioRoute(location: string): StudioRoute {
  const url = new URL(location || '/', 'https://studio.local')
  const params = url.searchParams
  const segments = url.pathname.split('/')
  let workspaceId = params.get('workspace') || ''
  let boardId = params.get('board') || undefined
  let view = params.get('view')
  try {
    if (segments[1] === 'w' && segments[2]) {
      workspaceId = decodeURIComponent(segments[2])
      view = segments[3] || 'canvas'
      if (view === 'canvas' && segments[4])
        boardId = decodeURIComponent(segments[4])
    }
  } catch {
    /* A malformed path falls back to the legacy query route. */
  }
  return {
    workspaceId,
    boardId,
    view:
      view === 'requirements' || view === 'design' || view === 'notes'
        ? view
        : 'canvas',
    canvasMode: params.get('canvas') === 'wireframes' ? 'wireframes' : 'canvas',
    requirementId: params.get('requirement') || undefined,
  }
}
