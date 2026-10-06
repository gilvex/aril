import type { ReactNode } from 'react'
import type { CanvasTool } from './canvasTool.ts'
export type CanvasChromeProps = {
  navigation: ReactNode
  actions: ReactNode
  children: ReactNode
  tool: CanvasTool
  onTool: (tool: CanvasTool) => void
  multiSelect: boolean
  onMultiSelect: (value: boolean) => void
  preview?: boolean
}
