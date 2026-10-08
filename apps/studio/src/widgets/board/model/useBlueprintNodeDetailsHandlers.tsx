import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { Idea } from '@pomegranate/domain/workspace'
import { useCallback } from 'react'

import type { BlueprintNodeDetailsHandlersProps } from '../types/useBlueprintNodeDetailsHandlersProps.ts'
export function useBlueprintNodeDetailsHandlers({
  updateNode,
  node,
  update,
  board,
  setSelected,
}: BlueprintNodeDetailsHandlersProps) {
  const changeKind = useCallback<(e: SelectChange) => void>(
    (e) =>
      updateNode({
        kind: e.target.value as Idea['data']['kind'],
      }),
    [updateNode],
  )
  const changeStatus = useCallback<(e: SelectChange) => void>(
    (e) =>
      updateNode({
        status: e.target.value as Idea['data']['status'],
      }),
    [updateNode],
  )
  const handleLinkARequirementChange = useCallback<(e: SelectChange) => void>(
    (e) => {
      if (e.target.value)
        updateNode({
          requirements: [...node.data.requirements, e.target.value],
        })
    },
    [updateNode, node],
  )
  const duplicateNode = useCallback<() => void>(() => {
    const id = crypto.randomUUID()
    update({
      ...board,
      nodes: [
        ...board.nodes,
        {
          ...structuredClone(node),
          id,
          position: {
            x: node.position.x + 40,
            y: node.position.y + 190,
          },
          data: {
            ...node.data,
            title: `${node.data.title.slice(0, 110)} copy`,
          },
        },
      ],
    })
    setSelected(id)
  }, [update, board, node, setSelected])
  return {
    changeKind,
    changeStatus,
    handleLinkARequirementChange,
    duplicateNode,
  }
}
