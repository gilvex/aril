import type { SelectChange } from '@/shared/types/selectChange.ts'
import { useCallback } from 'react'

import type { WireframeEdgeDetailsHandlersProps } from '../types/useWireframeEdgeDetailsHandlersProps.ts'
export function useWireframeEdgeDetailsHandlers({
  save,
  graph,
  edge,
  setEdgeId,
}: WireframeEdgeDetailsHandlersProps) {
  const handleInteractionLabelChange = useCallback<
    (e: import('react').ChangeEvent<HTMLInputElement, HTMLInputElement>) => void
  >(
    (e) =>
      save({
        ...graph,
        edges: graph.edges.map((link) =>
          link.id === edge.id ? { ...link, label: e.target.value } : link,
        ),
      }),
    [save, graph, edge],
  )
  const handleInteractionDestinationChange = useCallback<
    (e: SelectChange) => void
  >(
    (e) =>
      save({
        ...graph,
        edges: graph.edges.map((link) =>
          link.id === edge.id ? { ...link, target: e.target.value } : link,
        ),
      }),
    [save, graph, edge],
  )
  const handleClick = useCallback<() => void>(() => {
    save({
      ...graph,
      edges: graph.edges.filter((e) => e.id !== edge.id),
    })
    setEdgeId(null)
  }, [save, graph, edge, setEdgeId])
  return {
    handleInteractionLabelChange,
    handleInteractionDestinationChange,
    handleClick,
  }
}
