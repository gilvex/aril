import { useCanvasFullscreen } from '../model/useCanvasFullscreen.ts'
export type CanvasFullscreenControls = Pick<
  ReturnType<typeof useCanvasFullscreen>,
  'button' | 'fullscreen' | 'toggle'
>
