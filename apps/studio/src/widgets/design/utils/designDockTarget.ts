import type { DesignDockEdge } from '../types/designDockEdge.ts'
export function designDockTarget(
  x: number,
  y: number,
  width: number,
  height: number,
): DesignDockEdge | null {
  if (x < 0 || y < 0 || x > width || y > height) return null
  const distances: [DesignDockEdge, number][] = [
    ['left', x],
    ['right', width - x],
    ['top', y],
    ['bottom', height - y],
  ]
  distances.sort((a, b) => a[1] - b[1])
  return distances[0][1] <= 40 ? distances[0][0] : null
}
