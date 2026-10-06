import type { CanvasInsertPoint } from '@/widgets/board/types/canvasInsertPoint.ts'
import { type ReactNode } from 'react'
export type CanvasInsertMenuProps = {
  point: CanvasInsertPoint
  title: string
  items: { id: string; label: string; icon: ReactNode; onSelect: () => void }[]
  disabled?: boolean
  onClose: () => void
}
