import type { CanvasStrokes } from '@aril/domain/drawing'
export type CanvasDrawingProps = {
  scope: string
  strokes?: CanvasStrokes
  onChange: (strokes: CanvasStrokes) => void
  disabled?: boolean
}
