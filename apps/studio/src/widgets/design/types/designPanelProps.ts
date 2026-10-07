import type { ReactNode } from 'react'
import type { DesignEditorModel } from './designEditorModel.ts'
export type DesignPanelProps = {
  model: DesignEditorModel
  side: 'left' | 'right'
  children: ReactNode
}
