export function sampleDemoCurve(
  from: { x: number; y: number },
  to: { x: number; y: number },
  progress: number,
  direction = 1,
) {
  const t = Math.max(0, Math.min(1, progress))
  // Quintic easing makes velocity and acceleration zero at both stops.
  const u = t * t * t * (t * (t * 6 - 15) + 10)
  const v = 1 - u
  const dx = to.x - from.x
  const dy = to.y - from.y
  const distance = Math.hypot(dx, dy)
  const bend = Math.min(140, distance * 0.22) * direction
  const normalX = distance ? -dy / distance : 0
  const normalY = distance ? dx / distance : 0
  // Cubic Bézier control points bend perpendicular to travel, even vertically.
  const first = 3 * v * v * u
  const second = 3 * v * u * u
  const along = first * 0.28 + second * 0.74 + u * u * u
  const across = (first + second * 0.55) * bend
  return {
    x: from.x + dx * along + normalX * across,
    y: from.y + dy * along + normalY * across,
  }
}
