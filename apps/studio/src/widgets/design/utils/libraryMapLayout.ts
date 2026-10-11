import type { Edge } from '@xyflow/react'
import type { LibraryMapNode } from '../types/libraryMapNode.ts'
/** Bounded, deterministic spring layout. Never simulates the full asset inventory. */
export function libraryMapLayout(nodes: LibraryMapNode[], edges: Edge[]) {
  const points = nodes.map((node, i) => ({
    node,
    x: Math.cos(i * 2.399963) * Math.sqrt(i + 1) * 210,
    y: Math.sin(i * 2.399963) * Math.sqrt(i + 1) * 180,
  }))
  const byId = new Map(points.map((point) => [point.node.id, point]))
  for (let step = 0; step < 90; step++) {
    const forces = points.map(() => ({ x: 0, y: 0 }))
    for (let a = 0; a < points.length; a++) {
      for (let b = a + 1; b < points.length; b++) {
        const dx = points[a].x - points[b].x,
          dy = points[a].y - points[b].y
        const distance = Math.max(1, Math.hypot(dx, dy))
        const spacing =
          points[a].node.data.kind === 'cluster' ||
          points[b].node.data.kind === 'cluster'
            ? 350
            : 215
        const force = Math.max(0, spacing - distance) * 0.16
        forces[a].x += (dx / distance) * force
        forces[a].y += (dy / distance) * force
        forces[b].x -= (dx / distance) * force
        forces[b].y -= (dy / distance) * force
      }
    }
    for (const edge of edges) {
      const a = byId.get(edge.source),
        b = byId.get(edge.target)
      if (!a || !b) continue
      const dx = b.x - a.x,
        dy = b.y - a.y
      const distance = Math.max(1, Math.hypot(dx, dy))
      const force = Math.max(0, distance - 390) * 0.012
      a.x += (dx / distance) * force
      a.y += (dy / distance) * force
      b.x -= (dx / distance) * force
      b.y -= (dy / distance) * force
    }
    points.forEach((p, i) => {
      p.x += forces[i].x
      p.y += forces[i].y
    })
  }
  return points.map(({ node, x, y }) => ({
    ...node,
    position: { x: Math.round(x), y: Math.round(y) },
  }))
}
