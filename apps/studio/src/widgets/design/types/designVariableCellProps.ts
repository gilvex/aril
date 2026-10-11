import type { DesignVariable } from '@pomegranate/domain/designLibrary'
export type DesignVariableCellProps = {
  variable: DesignVariable
  mode: string
  disabled?: boolean
  save: (variable: DesignVariable) => void
}
