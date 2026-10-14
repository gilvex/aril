import type { DesignVariable } from '@aril/domain/designLibrary'
import type { DesignEditorModel } from './designEditorModel.ts'
export type DesignVariableRowProps = {
  variable: DesignVariable
  modes: string[]
  model: DesignEditorModel
}
