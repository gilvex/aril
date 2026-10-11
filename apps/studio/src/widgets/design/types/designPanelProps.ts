import type { ReactNode } from 'react'
import type { DesignEditorModel } from './designEditorModel.ts'
export type DesignPanelProps = {
  label?: string
  model: DesignEditorModel
  side: 'left' | 'right'
  children: ReactNode
}
