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
  let seed = 12345 + targets.length
  const random = () => {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    return (seed >>> 0) / 4294967296
  }
  let time = Math.max(0, elapsed),
    index = 0,
    previous = -1
  // Deterministic random walk: varied visits and reading times without a loop reset.
  for (;;) {
    const point = targets[index]
    const choices = targets
      .map((_, i) => i)
      .filter((i) => i !== index && (targets.length < 3 || i !== previous))
    const nextIndex = choices[Math.floor(random() * choices.length)]
    const next = targets[nextIndex]
    const pause = point.pause * (0.85 + random() * 0.55)
    const duration = Math.max(
      1500,
      Math.hypot(next.x - point.x, next.y - point.y) * 6,
    )
    const direction = random() > 0.5 ? 1 : -1
    if (time < pause)
      return {
        cursor: { x: point.x, y: point.y },
        camera: point.camera || null,
        selected: time > 140 ? [point.id] : [],
      }
    if (time < pause + duration) {
      const progress = (time - pause) / duration
      const camera =
        point.camera && next.camera
          ? {
              ...sampleDemoCurve(
                point.camera,
                next.camera,
                progress,
                direction * 0.3,
              ),
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
    time -= pause + duration
    previous = index
    index = nextIndex
  }
}
