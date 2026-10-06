import type { StudioView } from './studioView.ts'
export type StudioRoute = {
  workspaceId: string
  boardId?: string
  view: StudioView
  canvasMode: 'canvas' | 'wireframes'
  requirementId?: string
}
