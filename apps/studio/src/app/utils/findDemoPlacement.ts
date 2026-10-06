import type { Idea } from '@pomegranate/domain/workspace'
import { isDemoPlacementClear } from './isDemoPlacementClear.ts'
import { demoNodeBounds } from './demoNodeBounds.ts'

export function findDemoPlacement(
  nodes: Idea[],
  node: Idea,
  random: () => number,
  moving = false,
) {
  const originals = nodes.filter((item) => !item.id.startsWith('demo-maya-'))
  if (!originals.length) return null
  const left = Math.min(...originals.map((item) => item.position.x))
  const top =
    Math.max(
      ...originals.map((item) => item.position.y + demoNodeBounds(item).height),
    ) + 100
  const candidates: Idea['position'][] = []
  // A bounded working row keeps the demo readable instead of wandering with the cursor.
  for (let column = 0; column < 4; column++) {
    const point = { x: left + column * 320, y: top }
    if (!moving) {
      point.x += 32 + Math.round(random() * 24)
      point.y += 28 + Math.round(random() * 28)
    }
    const distance = Math.hypot(
      point.x - node.position.x,
      point.y - node.position.y,
    )
    if (moving && (distance < 20 || distance > 140)) continue
    if (isDemoPlacementClear(nodes, node, point, moving)) candidates.push(point)
  }
  candidates.sort(
    (a, b) =>
      Math.hypot(a.x - node.position.x, a.y - node.position.y) -
      Math.hypot(b.x - node.position.x, b.y - node.position.y),
  )
  return candidates.length
    ? candidates[
        Math.floor(random() * Math.min(moving ? 1 : 2, candidates.length))
      ]
    : null
}
