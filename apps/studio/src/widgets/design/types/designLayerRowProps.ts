import type { DesignElement } from '@pomegranate/domain/design'
import type { DesignEditorModel } from './designEditorModel.ts'
export type DesignLayerRowProps = {
  node: DesignElement
  model: DesignEditorModel
  depth: number
}
