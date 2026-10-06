import type { DemoPlanner } from '../types/demoPlanner.ts'

export function nextDemoRandom(planner: DemoPlanner) {
  let value = planner.seed || 1
  value ^= value << 13
  value ^= value >>> 17
  value ^= value << 5
  planner.seed = value >>> 0
  return planner.seed / 4294967296
}
