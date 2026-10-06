import type { Idea } from '@pomegranate/domain/workspace'
import { demoNodeBounds } from './demoNodeBounds.ts'
import { sampleDemoCurve } from './sampleDemoCurve.ts'

export function isDemoPlacementClear(
  nodes: Idea[],
  node: Idea,
  destination: Idea['position'],
  checkPath = false,
) {
  const size = demoNodeBounds(node)
  const obstacles = nodes
    .filter((item) => item.id !== node.id)
    .map(demoNodeBounds)
  const steps = checkPath
    ? Math.max(
        32,
        Math.ceil(
          Math.hypot(
            destination.x - node.position.x,
            destination.y - node.position.y,
          ) / 8,
        ),
      )
    : 1
  for (let step = checkPath ? 0 : 1; step <= steps; step++) {
    const point = checkPath
      ? sampleDemoCurve(node.position, destination, step / steps)
      : destination
    if (
      obstacles.some(
        (other) =>
          point.x < other.x + other.width + 32 &&
          point.x + size.width + 32 > other.x &&
          point.y < other.y + other.height + 32 &&
          point.y + size.height + 32 > other.y,
      )
    )
      return false
  }
  return true
}
