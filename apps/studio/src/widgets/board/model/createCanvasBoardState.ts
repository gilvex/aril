import type { CanvasInsertPoint } from '@/widgets/board/types/canvasInsertPoint.ts'
import type { CanvasTool } from '@/widgets/board/types/canvasTool.ts'
export function createCanvasBoardState() {
  const localDragging = new Set<string>()
  const tool: CanvasTool = 'select'
  const inspectorPreference: boolean | null = null
  const touchSelection: boolean = false
  const selectedIds = new Set<string>()
  const selectedEdge: string | null = null
  const dimensions: Record<string, { width: number; height: number }> = {}
  const palette: boolean = false
  const insertPoint: CanvasInsertPoint | null = null
  return {
    localDragging: [...localDragging],
    tool,
    inspectorPreference,
    touchSelection,
    selectedIds: [...selectedIds],
    selectedEdge,
    dimensions,
    palette,
    insertPoint,
  }
}
