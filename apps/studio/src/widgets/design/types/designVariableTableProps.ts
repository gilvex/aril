import type { DesignEditorModel } from './designEditorModel.ts'
import type { DesignLibrary } from '@pomegranate/domain/designLibrary'
export type DesignVariableTableProps = {
  model: DesignEditorModel
  collection: DesignLibrary['collections'][string]
}
