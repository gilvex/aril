import { useCallback } from 'react'

import type { LinkedRequirementHandlersProps } from '../types/useLinkedRequirementHandlersProps.ts'
export function useLinkedRequirementHandlers({
  updateNode,
  node,
  id,
}: LinkedRequirementHandlersProps) {
  const handleClick = useCallback<() => void>(
    () =>
      updateNode({
        requirements: node.data.requirements.filter((r) => r !== id),
      }),
    [updateNode, node, id],
  )
  return { handleClick }
}
