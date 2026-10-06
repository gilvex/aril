import type { Point } from '@/widgets/board/types/wireRoutingPoint.ts'
import type { Rect } from '@/widgets/board/types/wireRoutingRect.ts'
export const inside = (p: Point, r: Rect) =>
  p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom
