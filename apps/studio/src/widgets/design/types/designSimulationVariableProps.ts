import type { DesignVariable } from '@aril/domain/designLibrary'
import type { DesignEditorModel } from './designEditorModel.ts'
export type DesignSimulationVariableProps = {
  variable: DesignVariable
  model: DesignEditorModel
}
