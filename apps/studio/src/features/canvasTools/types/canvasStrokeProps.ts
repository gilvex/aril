import type { CanvasStrokes } from '@aril/domain/drawing'
export type CanvasStrokeProps = {
  id: string
  stroke: CanvasStrokes[string]
  zoom: number
  label: string
  selected: boolean
  selectable: boolean
  select: (id: string, additive: boolean) => void
}
