import type { SelectChange } from '@/shared/types/selectChange.ts'
import { removeWireNodes, type WireNode } from '@pomegranate/domain/wireframe'
import { useCallback } from 'react'

import type { WireframeMultiSelectionHandlersProps } from '../types/useWireframeMultiSelectionHandlersProps.ts'
export function useWireframeMultiSelectionHandlers({
  save,
  graph,
  selection,
  setSelection,
}: WireframeMultiSelectionHandlersProps) {
  const handleChange = useCallback<(e: SelectChange) => void>(
    (e) =>
      save({
        ...graph,
        nodes: graph.nodes.map((n) =>
          selection.has(n.id)
            ? {
                ...n,
                data: {
                  ...n.data,
                  tone: e.target.value as WireNode['data']['tone'],
                },
              }
            : n,
        ),
      }),
    [save, graph, selection],
  )
  const handleClick = useCallback<() => void>(() => {
    save(removeWireNodes(graph, selection))
    setSelection(new Set())
  }, [save, graph, selection, setSelection])
  return { handleChange, handleClick }
}
