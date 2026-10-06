import type { CameraPresence } from '@pomegranate/domain/collaboration'

export type DemoCursorTarget = {
  id: string
  x: number
  y: number
  pause: number
  camera?: CameraPresence
}
