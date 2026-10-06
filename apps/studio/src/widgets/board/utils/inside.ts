import type { Point } from '../types/wireRoutingPoint.ts'
import type { Rect } from '../types/wireRoutingRect.ts'
export const inside = (p: Point, r: Rect) =>
  p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom
