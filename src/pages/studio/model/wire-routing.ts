import {
  wirePosition,
  type Wireframe,
  type WireNode,
} from '../../../../domain/wireframe.ts'

export function wireConnectionSides(
  source: WireNode,
  target: WireNode,
  nodes: WireNode[],
) {
  const from = wirePosition(source, nodes),
    to = wirePosition(target, nodes)
  const backwards = to.x + target.width / 2 < from.x + source.width / 2
  return backwards
    ? { sourceSide: 'left' as const, targetSide: 'right' as const }
    : { sourceSide: 'right' as const, targetSide: 'left' as const }
}

type Point = { x: number; y: number }
type Rect = { left: number; right: number; top: number; bottom: number }
export type WireRoute = {
  path: string
  labelX: number
  labelY: number
  points: Point[]
}

const inside = (p: Point, r: Rect) =>
  p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom
function crosses(a: Point, b: Point, r: Rect) {
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

function roundedPath(points: Point[]) {
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1],
      b = points[i],
      c = points[i + 1]
    const before = Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
    const after = Math.abs(c.x - b.x) + Math.abs(c.y - b.y)
    const radius = Math.min(12, before / 2, after / 2)
    path += ` L ${b.x + ((a.x - b.x) * radius) / before} ${b.y + ((a.y - b.y) * radius) / before}`
    path += ` Q ${b.x} ${b.y} ${b.x + ((c.x - b.x) * radius) / after} ${b.y + ((c.y - b.y) * radius) / after}`
  }
  const end = points.at(-1)!
  return `${path} L ${end.x} ${end.y}`
}

// An orthogonal visibility grid keeps routes outside other blocks and screens.
// Screen children are local obstacles only when the route starts/ends inside it.
function findPath(start: Point, end: Point, obstacles: Rect[]): Point[] | null {
  const xs = [
    ...new Set([
      start.x,
      end.x,
      ...obstacles.flatMap((r) => [r.left, r.right]),
    ]),
  ].sort((a, b) => a - b)
  const ys = [
    ...new Set([
      start.y,
      end.y,
      ...obstacles.flatMap((r) => [r.top, r.bottom]),
    ]),
  ].sort((a, b) => a - b)
  const width = xs.length
  const startId = ys.indexOf(start.y) * width + xs.indexOf(start.x)
  const endId = ys.indexOf(end.y) * width + xs.indexOf(end.x)
  const point = (id: number) => ({
    x: xs[id % width],
    y: ys[Math.floor(id / width)],
  })
  const scores = new Map<number, number>([[startId, 0]])
  const previous = new Map<number, number>()
  const queue: { id: number; score: number }[] = []
  function push(id: number, score: number) {
    let i = queue.length
    queue.push({ id, score })
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (queue[parent].score <= score) break
      queue[i] = queue[parent]
      i = parent
    }
    queue[i] = { id, score }
  }
  function pop() {
    const first = queue[0],
      last = queue.pop()!
    if (queue.length) {
      let i = 0
      while (i * 2 + 1 < queue.length) {
        let child = i * 2 + 1
        if (
          child + 1 < queue.length &&
          queue[child + 1].score < queue[child].score
        )
          child++
        if (last.score <= queue[child].score) break
        queue[i] = queue[child]
        i = child
      }
      queue[i] = last
    }
    return first
  }
  push(startId, 0)
  const visited = new Set<number>()
  while (queue.length) {
    const { id } = pop()
    if (visited.has(id)) continue
    if (id === endId) {
      const result = [end]
      let cursor = endId
      while (cursor !== startId) {
        cursor = previous.get(cursor)!
        result.push(point(cursor))
      }
      return result.reverse()
    }
    visited.add(id)
    const a = point(id),
      x = id % width,
      y = Math.floor(id / width)
    const neighbors = [
      x > 0 ? id - 1 : -1,
      x < width - 1 ? id + 1 : -1,
      y > 0 ? id - width : -1,
      y < ys.length - 1 ? id + width : -1,
    ]
    for (const next of neighbors) {
      if (next < 0 || visited.has(next)) continue
      const b = point(next)
      if (obstacles.some((r) => inside(b, r) || crosses(a, b, r))) continue
      const distance =
        scores.get(id)! + Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
      if (distance >= (scores.get(next) ?? Infinity)) continue
      scores.set(next, distance)
      previous.set(next, id)
      push(next, distance + Math.abs(b.x - end.x) + Math.abs(b.y - end.y))
    }
  }
  return null
}

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
