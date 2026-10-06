import { useMemo } from 'react'
import { requirementOptions } from '../config/requirementOptions.ts'
import type { RequirementsViewProps } from '../types/requirementsViewProps.ts'
import { RequirementLane } from './RequirementLane.tsx'
export function RequirementsBoard({ model }: RequirementsViewProps) {
  const groups = useMemo(
    () =>
      requirementOptions[model.groupBy].map((value) => ({
        value,
        items: model.results.filter((item) => item[model.groupBy] === value),
      })),
    [model.groupBy, model.results],
  )
  return (
    <div className="requirements-board">
      {groups.map((group) => (
        <RequirementLane key={group.value} {...group} model={model} />
      ))}
    </div>
  )
}
