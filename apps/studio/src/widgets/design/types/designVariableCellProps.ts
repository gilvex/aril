import type { DesignVariable } from '@pomegranate/domain/designLibrary'
export type DesignVariableCellProps = {
  variable: DesignVariable
  mode: string
  save: (variable: DesignVariable) => void
}
