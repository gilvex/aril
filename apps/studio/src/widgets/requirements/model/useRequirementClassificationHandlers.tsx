import type { Requirement } from '@pomegranate/domain/workspace'
import { useCallback } from 'react'

import type { RequirementClassificationHandlersProps } from '../types/useRequirementClassificationHandlersProps.ts'
export function useRequirementClassificationHandlers({
  update,
}: RequirementClassificationHandlersProps) {
  const handleRequirementPriorityChange = useCallback<
    (
      e: import('react').ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
    ) => void
  >(
    (e) =>
      update({
        priority: e.target.value as Requirement['priority'],
      }),
    [update],
  )
  const handleRequirementStatusChange = useCallback<
    (
      e: import('react').ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
    ) => void
  >(
    (e) =>
      update({
        status: e.target.value as Requirement['status'],
      }),
    [update],
  )
  return { handleRequirementPriorityChange, handleRequirementStatusChange }
}
