import type { CameraPresence } from '../../collaboration/index.ts'
import type { Size } from '../types/size.ts'
import type { Viewport } from '../types/viewport.ts'
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
