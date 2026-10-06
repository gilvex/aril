import { type ReactNode } from 'react'
import type { CanvasInsertPoint } from './canvasInsertPoint.ts'
export type CanvasInsertMenuProps = {
  point: CanvasInsertPoint
  title: string
  items: { id: string; label: string; icon: ReactNode; onSelect: () => void }[]
  disabled?: boolean
  onClose: () => void
}
