import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { Requirement } from '@pomegranate/domain/workspace'
import { useCallback } from 'react'

import type { RequirementDetailsHandlersProps } from '../types/useRequirementDetailsHandlersProps.ts'
export function useRequirementDetailsHandlers({
  update,
  change,
  current,
  selectRequirement,
}: RequirementDetailsHandlersProps) {
  const handleRequirementAreaChange = useCallback<(e: SelectChange) => void>(
    (e) =>
      update({
        category: e.target.value as Requirement['category'],
      }),
    [update],
  )
  const handleClick = useCallback<() => void>(() => {
    change((w) => ({
      ...w,
      requirements: w.requirements.filter((r) => r.id !== current.id),
      boards: w.boards.map((b) => ({
        ...b,
        nodes: b.nodes.map((n) => ({
          ...n,
          data: {
            ...n.data,
            requirements: n.data.requirements.filter((id) => id !== current.id),
          },
        })),
      })),
    }))
    selectRequirement(null)
  }, [change, current, selectRequirement])
  return { handleRequirementAreaChange, handleClick }
}
