import type { DemoCursorTarget } from '../types/demoCursorTarget.ts'

export function sampleDemoCursor(targets: DemoCursorTarget[], elapsed: number) {
  if (!targets.length) return { cursor: null, selected: [] as string[] }
  const durations = targets.map((point, index) => {
    const next = targets[(index + 1) % targets.length]
    return Math.max(
      320,
      Math.min(1100, Math.hypot(next.x - point.x, next.y - point.y) * 1.2),
    )
  })
  const total = targets.reduce(
    (sum, point, index) => sum + point.pause + durations[index],
    0,
  )
  let time = Math.max(0, elapsed) % total
  for (const [index, point] of targets.entries()) {
    const duration = durations[index]
    if (time < point.pause)
      return {
        cursor: { x: point.x, y: point.y },
        selected: time > 140 ? [point.id] : [],
      }
    if (time < point.pause + duration) {
      const next = targets[(index + 1) % targets.length]
      const progress = (time - point.pause) / duration
      const eased = progress * progress * (3 - 2 * progress)
      // A shallow arc with a deliberate stop, rather than endless orbiting.
      const bend = Math.sin(Math.PI * eased) * (index % 2 ? -12 : 18)
      return {
        cursor: {
          x: point.x + (next.x - point.x) * eased,
          y: point.y + (next.y - point.y) * eased + bend,
        },
        selected: [point.id],
      }
    }
    time -= point.pause + duration
  }
  return {
    cursor: { x: targets[0].x, y: targets[0].y },
    selected: [targets[0].id],
  }
}
