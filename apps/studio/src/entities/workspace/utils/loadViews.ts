import type { Workspace } from '@pomegranate/domain/workspace'

export function loadViews(workspace: Workspace, viewsKey: string): Workspace {
  try {
    const views = JSON.parse(sessionStorage.getItem(viewsKey) || '{}')
    return {
      ...workspace,
      boards: workspace.boards.map((board) => {
        const valid = (view: Workspace['boards'][number]['viewport']) =>
          view &&
          Number.isFinite(view.x) &&
          Number.isFinite(view.y) &&
          view.zoom >= 0.1 &&
          view.zoom <= 3
        return {
          ...board,
          ...(valid(views[board.id]) ? { viewport: views[board.id] } : {}),
          ...(valid(views[board.id + ':wireframes'])
            ? { wireframeViewport: views[board.id + ':wireframes'] }
            : {}),
        }
      }),
    }
  } catch {
    return workspace
  }
}
