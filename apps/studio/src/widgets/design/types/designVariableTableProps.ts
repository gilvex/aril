import type { DesignEditorModel } from './designEditorModel.ts'
import type { DesignLibrary } from '@aril/domain/designLibrary'
export type DesignVariableTableProps = {
  model: DesignEditorModel
  collection: DesignLibrary['collections'][string]
}
