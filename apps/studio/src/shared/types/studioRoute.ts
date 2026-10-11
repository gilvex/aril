import type { StudioView } from '@/shared/types/studioView.ts'
export type StudioRoute = {
  libraryBoardId?: string
  workspaceId: string
  boardId?: string
  view: StudioView
  canvasMode: 'canvas' | 'wireframes' | 'design'
  requirementId?: string
}
