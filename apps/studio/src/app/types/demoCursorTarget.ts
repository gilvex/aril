import type { CameraPresence } from '@aril/domain/collaboration'

export type DemoCursorTarget = {
  id: string
  x: number
  y: number
  pause: number
  camera?: CameraPresence
}
