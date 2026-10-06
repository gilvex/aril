import type { DemoCursorTarget } from '../types/demoCursorTarget.ts'
import { sampleDemoCurve } from './sampleDemoCurve.ts'

export function sampleDemoCursor(targets: DemoCursorTarget[], elapsed: number) {
  if (!targets.length)
    return { cursor: null, camera: null, selected: [] as string[] }
  if (targets.length === 1)
    return {
      cursor: { x: targets[0].x, y: targets[0].y },
      camera: targets[0].camera || null,
      selected: [targets[0].id],
    }
  const durations = targets.map((point, index) => {
    const next = targets[(index + 1) % targets.length]
    return Math.max(
      point.camera ? 1100 : 320,
      Math.min(1800, Math.hypot(next.x - point.x, next.y - point.y) * 1.8),
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
        camera: point.camera || null,
        selected: time > 140 ? [point.id] : [],
      }
    if (time < point.pause + duration) {
      const next = targets[(index + 1) % targets.length]
      const progress = (time - point.pause) / duration
      const direction = index % 2 ? -1 : 1
      const camera =
        point.camera && next.camera
          ? {
              ...sampleDemoCurve(
                point.camera,
                next.camera,
                progress,
                direction * 0.45,
              ),
              // Interpolate logarithmic zoom for a constant proportional scale change.
              zoom: Math.exp(
                sampleDemoCurve(
                  { x: Math.log(point.camera.zoom), y: 0 },
                  { x: Math.log(next.camera.zoom), y: 0 },
                  progress,
                  0,
                ).x,
              ),
            }
          : point.camera || null
      return {
        cursor: sampleDemoCurve(point, next, progress, direction),
        camera,
        selected: [point.id],
      }
    }
    time -= point.pause + duration
  }
  return {
    cursor: { x: targets[0].x, y: targets[0].y },
    camera: targets[0].camera || null,
    selected: [targets[0].id],
  }
}
