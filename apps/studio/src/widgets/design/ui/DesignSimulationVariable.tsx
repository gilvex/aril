import { useCallback } from 'react'
import { DesignVariableValue } from './DesignVariableValue.tsx'
import type { DesignSimulationVariableProps } from '../types/designSimulationVariableProps.ts'
export function DesignSimulationVariable({
  variable,
  model,
}: DesignSimulationVariableProps) {
  const { simulation, patch } = model
  const change = useCallback(
    (value: string | number | boolean) => {
      if (simulation)
        patch({
          simulation: {
            ...simulation,
            values: { ...simulation.values, [variable.id]: value },
          },
        })
    },
    [simulation, patch, variable.id],
  )
  if (!simulation) return null
  return (
    <label className="design-simulation-variable">
      <span>{variable.name}</span>
      <DesignVariableValue
        type={variable.type}
        value={simulation.values[variable.id]}
        label={variable.name}
        onChange={change}
      />
    </label>
  )
}
