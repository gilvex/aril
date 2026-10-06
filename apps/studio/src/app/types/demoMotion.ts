import type { CameraPresence } from '@pomegranate/domain/collaboration'

export type DemoMotion = {
  origin: { x: number; y: number }
  camera: CameraPresence
  destinationCamera: CameraPresence
  approach: number
  work: number
}
