import type { CanvasStrokes } from '@pomegranate/domain/drawing'
export function strokePath(stroke: CanvasStrokes[string]) {
  const points = stroke.points
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length - 1; i++) {
    const point = points[i]
    const next = points[i + 1]
    path += ` Q ${point.x} ${point.y} ${(point.x + next.x) / 2} ${(point.y + next.y) / 2}`
  }
  const last = points[points.length - 1]
  return `${path} L ${last.x} ${last.y}`
}
