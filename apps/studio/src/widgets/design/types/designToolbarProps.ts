import type { DesignEditorModel } from './designEditorModel.ts'
import type { DesignElement } from '@aril/domain/design'
export type DesignToolbarProps = {
  navigation?: import('react').ReactNode
  model: DesignEditorModel
  add: (kind: DesignElement['kind'], mobile?: boolean) => void
  insertTemplate: () => void
}
