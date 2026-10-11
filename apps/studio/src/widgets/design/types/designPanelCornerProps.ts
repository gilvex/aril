import type { DesignEditorModel } from './designEditorModel.ts'
export type DesignPanelCornerProps = {
  label?: string
  model: DesignEditorModel
  side: 'left' | 'right'
  width: number
  height: number
  widthLimit: number
  heightLimit: number
}
