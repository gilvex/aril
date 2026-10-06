import type { Operation, Presence } from '@pomegranate/domain/collaboration'
import type { DemoMotion } from './demoMotion.ts'

export type DemoAction = {
  id: string
  at: number
  duration: number
  peerId: string
  view: string
  boardId: string | null
  targetId: string
  operations: Operation[]
  message: string
  focus?: { x: number; y: number }
  drag?: { from: { x: number; y: number }; to: { x: number; y: number } }
  field?: NonNullable<Presence['requirement']>['field']
  motion?: DemoMotion
  intent?: string
}
