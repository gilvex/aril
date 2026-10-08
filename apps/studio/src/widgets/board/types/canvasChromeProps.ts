import type { CanvasTool } from '@/widgets/board/types/canvasTool.ts'
import type { ReactNode } from 'react'
export type CanvasChromeProps = {
  navigation: ReactNode
  actions: ReactNode
  children: ReactNode
  tool: CanvasTool
  onTool: (tool: CanvasTool) => void
  multiSelect: boolean
  onMultiSelect: (value: boolean) => void
  preview?: boolean
  onModeChange?: (
    mode: import('@/features/canvasTools/index.ts').CanvasToolMode,
  ) => void
}
