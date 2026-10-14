import type { DesignVariable } from '@aril/domain/designLibrary'
export type DesignVariableCellProps = {
  variable: DesignVariable
  mode: string
  disabled?: boolean
  save: (variable: DesignVariable) => void
}
