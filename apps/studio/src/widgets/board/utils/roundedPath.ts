import type { Point } from '../types/wireRoutingPoint.ts'
export function roundedPath(points: Point[]) {
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1],
      b = points[i],
      c = points[i + 1]
    const before = Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
    const after = Math.abs(c.x - b.x) + Math.abs(c.y - b.y)
    const radius = Math.min(12, before / 2, after / 2)
    path += ` L ${b.x + ((a.x - b.x) * radius) / before} ${b.y + ((a.y - b.y) * radius) / before}`
    path += ` Q ${b.x} ${b.y} ${b.x + ((c.x - b.x) * radius) / after} ${b.y + ((c.y - b.y) * radius) / after}`
  }
  const end = points.at(-1)!
  return `${path} L ${end.x} ${end.y}`
}
