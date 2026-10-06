import type { StudioRoute } from '@/shared/types/studioRoute.ts'
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
