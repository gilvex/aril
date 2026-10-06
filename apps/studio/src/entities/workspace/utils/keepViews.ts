import type { Workspace } from '@pomegranate/domain/workspace'

export function keepViews(next: Workspace, local: Workspace): Workspace {
  return {
    ...next,
    boards: next.boards.map((board) => ({
      ...board,
      viewport: local.boards.find((b) => b.id === board.id)?.viewport,
      wireframeViewport: local.boards.find((b) => b.id === board.id)
        ?.wireframeViewport,
    })),
  }
}
