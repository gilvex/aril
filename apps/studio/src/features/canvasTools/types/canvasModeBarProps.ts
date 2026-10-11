import type { ReactNode } from 'react'
import type { CanvasToolMode } from './canvasToolMode.ts'
export type CanvasModeBarProps = {
  className?: string
  label: string
  navigation: ReactNode
  children: ReactNode
  extras?: ReactNode
  hideMotion?: boolean
  onModeChange?: (mode: CanvasToolMode) => void
}
