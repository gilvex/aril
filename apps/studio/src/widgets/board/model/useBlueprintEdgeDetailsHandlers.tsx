import { useCallback } from 'react'

import type { BlueprintEdgeDetailsHandlersProps } from '../types/useBlueprintEdgeDetailsHandlersProps.ts'
export function useBlueprintEdgeDetailsHandlers({
  update,
  board,
  edge,
  setSelectedEdge,
}: BlueprintEdgeDetailsHandlersProps) {
  const handleConnectionLabelChange = useCallback<
    (e: import('react').ChangeEvent<HTMLInputElement, HTMLInputElement>) => void
  >(
    (e) =>
      update({
        ...board,
        edges: board.edges.map((x) =>
          x.id === edge.id ? { ...x, label: e.target.value } : x,
        ),
      }),
    [update, board, edge],
  )
  const handleClick = useCallback<() => void>(() => {
    update({
      ...board,
      edges: board.edges.filter((e) => e.id !== edge.id),
    })
    setSelectedEdge(null)
  }, [update, board, edge, setSelectedEdge])
  return { handleConnectionLabelChange, handleClick }
}
