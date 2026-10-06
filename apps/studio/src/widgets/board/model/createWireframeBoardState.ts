import type { CanvasInsertPoint } from '../types/canvasInsertPoint.ts'
import type { CanvasTool } from '../types/canvasTool.ts'
export function createWireframeBoardState() {
  const tool: CanvasTool = 'select'
  const inspectorPreference: boolean | null = null
  const touchSelection: boolean = false
  const selection = new Set<string>()
  const edgeId: string | null = null
  const palette: boolean = false
  const insertPoint: CanvasInsertPoint | null = null
  const preview: boolean = false
  const previewMessage: string = 'Click a connected block to follow its flow.'
  const targetId: string = ''
  const trigger: string = 'On click'
  const moving = new Set<string>()
  return {
    tool,
    inspectorPreference,
    touchSelection,
    selection: [...selection],
    edgeId,
    palette,
    insertPoint,
    preview,
    previewMessage,
    targetId,
    trigger,
    moving: [...moving],
  }
}
