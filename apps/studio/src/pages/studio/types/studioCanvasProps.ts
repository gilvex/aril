import { useWorkspace } from '@/entities/workspace/index.ts'
import { useCanvasFullscreen } from '@/features/canvasFullscreen/index.ts'
import { useMultiplayer } from '@/features/liveSession/index.ts'
import type { Presence } from '@pomegranate/domain/collaboration'
import type * as React from 'react'
import { useStudioModel } from '../model/useStudioModel.ts'
import { CanvasBoard } from '../ui/CanvasBoard.tsx'

export type StudioCanvasProps = {
  studio: import('./studioProps.ts').StudioProps['studio']
  BoardCanvas: typeof CanvasBoard
  full: ReturnType<typeof useCanvasFullscreen>
  board: ReturnType<typeof useWorkspace>['workspace']['boards'][number]
  canvasMode: 'canvas' | 'wireframes' | 'design'
  followed: Presence | null | undefined
  followStatus: React.ReactNode
  workspace: ReturnType<typeof useWorkspace>['workspace']
  setBoardId: ReturnType<typeof useStudioModel>['setBoardId']
  setCanvasMode: ReturnType<typeof useStudioModel>['setCanvasMode']
  present: Pick<Presence, 'profile' | 'view' | 'boardId'>[]
  setBoardName: ReturnType<typeof useStudioModel>['setBoardName']
  setModal: ReturnType<typeof useStudioModel>['setModal']
  change: ReturnType<typeof useWorkspace>['change']
  multiplayer: ReturnType<typeof useMultiplayer>
  sendPresence: (
    changes: Partial<{
      camera: { x: number; y: number; zoom: number } | null
      following: string | null
      clientId: string
      boardId: string | null
      view:
        | 'canvas'
        | 'requirements'
        | 'design'
        | 'notes'
        | 'wireframes'
        | 'settings'
      cursor: { x: number; y: number } | null
      selected: string[]
      selectedEdges: string[]
      requirement: {
        id: string
        field:
          | 'description'
          | 'title'
          | 'status'
          | 'category'
          | 'priority'
          | 'acceptance'
          | null
        typing: boolean
      } | null
      dragging: { id: string; position: { x: number; y: number } }[]
      sequence?: number | undefined
    }>,
    force?: boolean,
  ) => void
  state: ReturnType<typeof useWorkspace>
  setRequirementId: ReturnType<typeof useStudioModel>['setRequirementId']
  setView: ReturnType<typeof useStudioModel>['setView']
}
