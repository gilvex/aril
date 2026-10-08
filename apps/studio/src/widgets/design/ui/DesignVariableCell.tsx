import { useCallback } from 'react'
import { DesignVariableValue } from './DesignVariableValue.tsx'
import type { DesignVariableCellProps } from '../types/designVariableCellProps.ts'
export function DesignVariableCell({
  variable,
  mode,
  save,
}: DesignVariableCellProps) {
  const change = useCallback(
    (value: string | number | boolean) =>
      save({ ...variable, values: { ...variable.values, [mode]: value } }),
    [variable, mode, save],
  )
  return (
    <DesignVariableValue
      type={variable.type}
      value={variable.values[mode]}
      label={`${variable.name} / ${mode}`}
      onChange={change}
    />
  )
}
