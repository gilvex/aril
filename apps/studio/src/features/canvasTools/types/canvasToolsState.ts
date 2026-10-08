import type { CanvasToolMode } from './canvasToolMode.ts'
import type { CanvasStrokes } from '@pomegranate/domain/drawing'
export type CanvasToolsState = {
  mode: CanvasToolMode
  drawing: 'pencil' | 'marker' | 'eraser' | null
  color: string
  width: number
  draft: CanvasStrokes[string] | null
  pointerId: number | null
  dataOpen: boolean
  flowIndex: number
}
