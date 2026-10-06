import type { CanvasInsertPoint } from './canvasInsertPoint.ts'
import type { CanvasTool } from './canvasTool.ts'

export type CanvasBoardState = {
  localDragging: string[]
  tool: CanvasTool
  inspectorPreference: boolean | null
  touchSelection: boolean
  selectedIds: string[]
  selectedEdge: string | null
  dimensions: Record<string, { width: number; height: number }>
  palette: boolean
  insertPoint: CanvasInsertPoint | null
}
