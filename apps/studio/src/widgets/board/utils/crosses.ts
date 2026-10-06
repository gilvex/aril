import type { Point } from '../types/wireRoutingPoint.ts'
import type { Rect } from '../types/wireRoutingRect.ts'
export function crosses(a: Point, b: Point, r: Rect) {
  return a.x === b.x
    ? a.x > r.left &&
        a.x < r.right &&
        Math.max(a.y, b.y) > r.top &&
        Math.min(a.y, b.y) < r.bottom
    : a.y > r.top &&
        a.y < r.bottom &&
        Math.max(a.x, b.x) > r.left &&
        Math.min(a.x, b.x) < r.right
}
