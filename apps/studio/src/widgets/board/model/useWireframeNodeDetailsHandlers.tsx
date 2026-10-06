import {
  removeWireNodes,
  wirePosition,
  type WireNode,
} from '@pomegranate/domain/wireframe'
import { useCallback } from 'react'

import type { WireframeNodeDetailsHandlersProps } from '../types/useWireframeNodeDetailsHandlersProps.ts'
export function useWireframeNodeDetailsHandlers({
  screens,
  node,
  graph,
  editNode,
  editData,
  save,
  selection,
  setSelection,
}: WireframeNodeDetailsHandlersProps) {
  const handleBlockScreenChange = useCallback<
    (
      e: import('react').ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
    ) => void
  >(
    (e) => {
      const parent = screens.find((n) => n.id === e.target.value)
      const absolute = wirePosition(node, graph.nodes)
      editNode({
        parentId: parent?.id,
        position: parent ? { x: 32, y: 72 } : absolute,
      })
    },
    [screens, node, graph, editNode],
  )
  const handleBlockAppearanceChange = useCallback<
    (
      e: import('react').ChangeEvent<HTMLSelectElement, HTMLSelectElement>,
    ) => void
  >(
    (e) =>
      editData({
        tone: e.target.value as WireNode['data']['tone'],
      }),
    [editData],
  )
  const handleClick = useCallback<() => void>(() => {
    save(removeWireNodes(graph, selection))
    setSelection(new Set())
  }, [save, graph, selection, setSelection])
  return { handleBlockScreenChange, handleBlockAppearanceChange, handleClick }
}
