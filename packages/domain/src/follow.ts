import type { CameraPresence } from './collaboration.ts'

type Viewport = { x: number; y: number; zoom: number }
type Size = { width: number; height: number }

// Share the world-space center so different screen sizes follow the same spot.
export function cameraFromViewport(view: Viewport, size: Size): CameraPresence {
  return {
    x: (size.width / 2 - view.x) / view.zoom,
    y: (size.height / 2 - view.y) / view.zoom,
    zoom: view.zoom,
  }
}

export function viewportFromCamera(
  camera: CameraPresence,
  size: Size,
): Viewport {
  return {
    x: size.width / 2 - camera.x * camera.zoom,
    y: size.height / 2 - camera.y * camera.zoom,
    zoom: camera.zoom,
  }
}
