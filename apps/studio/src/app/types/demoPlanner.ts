import type { Idea } from '@pomegranate/domain/workspace'
import type { CameraPresence } from '@pomegranate/domain/collaboration'
import type { DemoAction } from './demoAction.ts'

export type DemoPlanner = {
  seed: number
  sequence: number
  owned: Record<string, Idea>
  protectedIds: string[]
  recent: string[]
  nextAt: number
  lastTick: number
  action: DemoAction | null
  cursor: { x: number; y: number }
  camera: CameraPresence
  selected: string[]
}
