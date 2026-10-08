import type { DesignVariable } from '@pomegranate/domain/designLibrary'
import type { DesignEditorModel } from './designEditorModel.ts'
export type DesignVariableRowProps = {
  variable: DesignVariable
  modes: string[]
  model: DesignEditorModel
}
