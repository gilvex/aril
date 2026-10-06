import { useCanvasFullscreen } from '@/features/canvasFullscreen/model/useCanvasFullscreen.ts'
export type CanvasFullscreenControls = Pick<
  ReturnType<typeof useCanvasFullscreen>,
  'button' | 'fullscreen' | 'toggle'
>
