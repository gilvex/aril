import type { Idea } from '@pomegranate/domain/workspace'
import { useCallback } from 'react'

import type { BlueprintMultiSelectionHandlersProps } from '../types/useBlueprintMultiSelectionHandlersProps.ts'
export function useBlueprintMultiSelectionHandlers({
  checkpoint,
  update,
  board,
  selectedIds,
  onDelete,
  selectedNodes,
}: BlueprintMultiSelectionHandlersProps) {
  const handleSelectedNodesTypeChange = useCallback<
    (
      e: import('react').ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
    ) => void
  >(
    (e) => {
      checkpoint()
      update(
        {
          ...board,
          nodes: board.nodes.map((n) =>
            selectedIds.has(n.id)
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    kind: e.target.value as Idea['data']['kind'],
                  },
                }
              : n,
          ),
        },
        false,
      )
    },
    [checkpoint, update, board, selectedIds],
  )
  const handleSelectedNodesDecisionChange = useCallback<
    (
      e: import('react').ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
    ) => void
  >(
    (e) => {
      checkpoint()
      update(
        {
          ...board,
          nodes: board.nodes.map((n) =>
            selectedIds.has(n.id)
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    status: e.target.value as Idea['data']['status'],
                  },
                }
              : n,
          ),
        },
        false,
      )
    },
    [checkpoint, update, board, selectedIds],
  )
  const handleClick = useCallback<() => void>(() => {
    checkpoint()
    onDelete({ nodes: selectedNodes, edges: [] })
  }, [checkpoint, onDelete, selectedNodes])
  return {
    handleSelectedNodesTypeChange,
    handleSelectedNodesDecisionChange,
    handleClick,
  }
}
