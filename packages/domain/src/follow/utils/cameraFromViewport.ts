import type { CameraPresence } from '../../collaboration/index.ts'
import type { Size } from '../types/size.ts'
import type { Viewport } from '../types/viewport.ts'
export function cameraFromViewport(view: Viewport, size: Size): CameraPresence {
  return {
    x: (size.width / 2 - view.x) / view.zoom,
    y: (size.height / 2 - view.y) / view.zoom,
    zoom: view.zoom,
  }
}
