import type { Point } from '@/widgets/board/types/wireRoutingPoint.ts'
export type WireRoute = {
  path: string
  labelX: number
  labelY: number
  points: Point[]
}
