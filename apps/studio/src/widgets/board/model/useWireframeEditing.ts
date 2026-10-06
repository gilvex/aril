import { type WireNode } from '@pomegranate/domain/wireframe'
import { useCallback } from 'react'
import type { UseWireframeEditingProps } from '../types/useWireframeEditingProps.ts'
export function useWireframeEditing({
  setSelection,
  setEdgeId,
  node,
  save,
  graph,
}: UseWireframeEditingProps) {
  const select = useCallback(
    (id: string) => {
      setSelection(new Set([id]))
      setEdgeId(null)
    },
    [setSelection, setEdgeId],
  )
  const editNode = useCallback(
    (changes: Partial<WireNode>) => {
      if (node)
        save({
          ...graph,
          nodes: graph.nodes.map((n) =>
            n.id === node.id ? { ...n, ...changes } : n,
          ),
        })
    },
    [node, save, graph],
  )
  const editData = useCallback(
    (changes: Partial<WireNode['data']>) => {
      if (node) editNode({ data: { ...node.data, ...changes } })
    },
    [node, editNode],
  )
  return { select, editData, editNode }
}
