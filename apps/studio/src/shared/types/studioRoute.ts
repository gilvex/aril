import type { StudioView } from '@/shared/types/studioView.ts'
export type StudioRoute = {
  workspaceId: string
  boardId?: string
  view: StudioView
  canvasMode: 'canvas' | 'wireframes' | 'design'
  requirementId?: string
}
