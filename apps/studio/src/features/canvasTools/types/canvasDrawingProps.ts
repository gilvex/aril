import type { CanvasStrokes } from '@pomegranate/domain/drawing'
export type CanvasDrawingProps = {
  scope: string
  strokes?: CanvasStrokes
  onChange: (strokes: CanvasStrokes) => void
  disabled?: boolean
}
