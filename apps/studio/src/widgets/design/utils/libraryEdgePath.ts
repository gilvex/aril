import type { LibraryEdgeBounds } from '../types/libraryEdgeBounds.ts'
/** Connect node boundaries instead of fixed left/right handles. */
export function libraryEdgePath(
  source: LibraryEdgeBounds,
  target: LibraryEdgeBounds,
) {
  const a = { x: source.x + source.width / 2, y: source.y + source.height / 2 }
  const b = { x: target.x + target.width / 2, y: target.y + target.height / 2 }
  const dx = b.x - a.x,
    dy = b.y - a.y
  if (!dx && !dy) return ''
  const from =
    1 /
    Math.max(
      Math.abs(dx) / (source.width / 2 + 8),
      Math.abs(dy) / (source.height / 2 + 8),
    )
  const to =
    1 /
    Math.max(
      Math.abs(dx) / (target.width / 2 + 8),
      Math.abs(dy) / (target.height / 2 + 8),
    )
  const x1 = a.x + dx * from,
    y1 = a.y + dy * from,
    x2 = b.x - dx * to,
    y2 = b.y - dy * to
  const bend = Math.min(40, Math.hypot(dx, dy) * 0.08)
  const length = Math.hypot(dx, dy)
  return `M${x1},${y1} Q${(x1 + x2) / 2 - (dy / length) * bend},${(y1 + y2) / 2 + (dx / length) * bend} ${x2},${y2}`
}
