import type { DesignVariable } from '@pomegranate/domain/designLibrary'
import type { DesignEditorModel } from './designEditorModel.ts'
export type DesignSimulationVariableProps = {
  variable: DesignVariable
  model: DesignEditorModel
}
