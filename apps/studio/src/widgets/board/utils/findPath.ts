import type { Point } from '../types/wireRoutingPoint.ts'
import type { Rect } from '../types/wireRoutingRect.ts'
import { crosses } from './crosses.ts'
import { inside } from './inside.ts'
export function findPath(
  start: Point,
  end: Point,
  obstacles: Rect[],
): Point[] | null {
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
