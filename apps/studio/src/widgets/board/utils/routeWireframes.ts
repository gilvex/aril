import { type Wireframe, type WireNode } from '@pomegranate/domain/wireframe'
import type { WireRoute } from '../types/wireRoute.ts'
import type { Point } from '../types/wireRoutingPoint.ts'
import type { Rect } from '../types/wireRoutingRect.ts'
import { findPath } from './findPath.ts'
import { inside } from './inside.ts'
import { roundedPath } from './roundedPath.ts'
import { wireConnectionSides } from './wireConnectionSides.ts'
export function routeWireframes(nodes: WireNode[], edges: Wireframe['edges']) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const rects = new Map(
    nodes.map((n) => {
      const parent = byId.get(n.parentId || '')
      const left = n.position.x + (parent?.position.x || 0),
        top = n.position.y + (parent?.position.y || 0)
      return [
        n.id,
        { left, top, right: left + n.width, bottom: top + n.height },
      ]
    }),
  )
  const routes = new Map<string, WireRoute>()
  const labelPositions: Point[] = []
  edges.forEach((edge, index) => {
    const source = byId.get(edge.source),
      target = byId.get(edge.target)
    if (!source || !target) return
    const from = rects.get(source.id)!,
      to = rects.get(target.id)!
    const { sourceSide, targetSide } = wireConnectionSides(
      source,
      target,
      nodes,
    )
    const sourceDirection = sourceSide === 'right' ? 1 : -1
    const targetDirection = targetSide === 'right' ? 1 : -1
    const start = { x: from[sourceSide], y: (from.top + from.bottom) / 2 }
    const end = { x: to[targetSide], y: (to.top + to.bottom) / 2 }
    if (target.data.kind === 'screen') {
      const incoming = edges.filter(
        (e) =>
          e.target === target.id &&
          byId.has(e.source) &&
          wireConnectionSides(byId.get(e.source)!, target, nodes).targetSide ===
            targetSide,
      )
      const slot = incoming.findIndex((e) => e.id === edge.id)
      end.y +=
        (slot - (incoming.length - 1) / 2) *
        Math.min(48, target.height / (incoming.length + 1))
    }
    const clearance = 32 + (index % 8) * 12
    const targetGap = target.data.kind === 'screen' ? 24 + (index % 8) * 12 : 8
    const ancestors = new Set([source.parentId, target.parentId])
    const obstacles = nodes
      .filter(
        (n) =>
          n.id !== source.id &&
          n.id !== target.id &&
          !ancestors.has(n.id) &&
          (!n.parentId || ancestors.has(n.parentId)),
      )
      .map((n) => {
        const r = rects.get(n.id)!
        // Keep enough room for adjacent controls in the same screen.
        const gap = n.parentId ? 8 : clearance
        return {
          left: r.left - gap,
          right: r.right + gap,
          top: r.top - gap,
          bottom: r.bottom + gap,
        }
      })
    const exit = { x: start.x + sourceDirection * 16, y: start.y },
      entry = { x: end.x + targetDirection * (targetGap + 8), y: end.y }
    const terminalObstacle = (rect: Rect, gap: number) => ({
      left: rect.left - gap,
      right: rect.right + gap,
      top: rect.top - gap,
      bottom: rect.bottom + gap,
    })
    const path = findPath(exit, entry, [
      ...obstacles,
      terminalObstacle(from, 8),
      terminalObstacle(to, targetGap),
    ])
    if (!path) return // Overlapping blocks retain React Flow's standard connection.
    const raw = [start, ...path, end]
    const points = raw.filter((p, i) => {
      const a = raw[i - 1],
        b = raw[i + 1]
      return (
        !a ||
        !b ||
        !((a.x === p.x && p.x === b.x) || (a.y === p.y && p.y === b.y))
      )
    })
    // Put labels in open canvas space, favoring long horizontal segments.
    const candidates = points
      .slice(1)
      .flatMap((b, i) =>
        [0.5, 0.25, 0.75].map((fraction) => {
          const a = points[i],
            p = {
              x: a.x + (b.x - a.x) * fraction,
              y: a.y + (b.y - a.y) * fraction,
            }
          const inScreen = nodes.some(
            (n) =>
              n.data.kind === 'screen' &&
              inside(p, terminalObstacle(rects.get(n.id)!, 30)),
          )
          const collision = labelPositions.some(
            (l) => Math.abs(l.x - p.x) < 190 && Math.abs(l.y - p.y) < 36,
          )
          return {
            ...p,
            score:
              (inScreen ? -10000 : 10000) +
              (collision ? -20000 : 0) +
              (a.y === b.y ? 1000 : 0) +
              Math.abs(a.x - b.x) +
              Math.abs(a.y - b.y),
          }
        }),
      )
      .sort((a, b) => b.score - a.score)
    const label = candidates[0]
    labelPositions.push(label)
    routes.set(edge.id, {
      path: roundedPath(points),
      points,
      labelX: label.x,
      labelY: label.y,
    })
  })
  return routes
}
