import type { Idea } from '@pomegranate/domain/workspace'
import { isDemoPlacementClear } from './isDemoPlacementClear.ts'

export function findDemoPlacement(
  nodes: Idea[],
  node: Idea,
  random: () => number,
  moving = false,
) {
  const candidates: Idea['position'][] = []
  for (let i = 0; i < 160; i++) {
    const angle = random() * Math.PI * 2
    const radius = moving ? 75 + random() * 200 : 320 + random() * 1100
    const point = {
      x: Math.round((node.position.x + Math.cos(angle) * radius) / 20) * 20,
      y: Math.round((node.position.y + Math.sin(angle) * radius) / 20) * 20,
    }
    if (isDemoPlacementClear(nodes, node, point, moving)) candidates.push(point)
  }
  candidates.sort(
    (a, b) =>
      Math.hypot(a.x - node.position.x, a.y - node.position.y) -
      Math.hypot(b.x - node.position.x, b.y - node.position.y),
  )
  return candidates.length
    ? candidates[Math.floor(random() * Math.min(5, candidates.length))]
    : null
}
