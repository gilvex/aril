import type { CanvasInsertPoint } from './canvasInsertPoint.ts'
import type { CanvasTool } from './canvasTool.ts'

export type WireframeBoardState = {
  tool: CanvasTool
  inspectorPreference: boolean | null
  touchSelection: boolean
  selection: string[]
  edgeId: string | null
  palette: boolean
  insertPoint: CanvasInsertPoint | null
  preview: boolean
  previewMessage: string
  targetId: string
  trigger: string
  moving: string[]
}
