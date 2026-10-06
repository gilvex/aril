import type { WireFlowNode } from '@/widgets/board/types/wireFlowNode.ts'
import { type NodeChange } from '@xyflow/react'
import { useCallback } from 'react'
import type { UseWireframeChangesProps } from '../types/useWireframeChangesProps.ts'
export function useWireframeChanges({
  setSelection,
  moving,
  dragPositions,
  setMoving,
  sendPresence,
  save,
  graph,
}: UseWireframeChangesProps) {
  const onNodesChange = useCallback(
    (changes: NodeChange<WireFlowNode>[]) => {
      const selections = changes.filter((c) => c.type === 'select')
      if (selections.length)
        setSelection((previous) => {
          const next = new Set(previous)
          for (const change of selections) {
            if (change.selected) next.add(change.id)
            else next.delete(change.id)
          }
          return next
        })
      const positions = changes
        .filter((c) => c.type === 'position')
        .filter((c) => c.position)
      const dimensions = changes
        .filter((c) => c.type === 'dimensions')
        .filter((c) => c.dimensions && c.setAttributes)
      if (!positions.length && !dimensions.length) return
      const nextMoving = new Set(moving)
      for (const change of positions) {
        if (change.dragging === true) nextMoving.add(change.id)
        if (change.dragging === false) nextMoving.delete(change.id)
        if (
          change.position &&
          (change.dragging || dragPositions.current.has(change.id))
        )
          dragPositions.current.set(change.id, {
            id: change.id,
            position: change.position,
          })
      }
      setMoving(nextMoving)
      if (dragPositions.current.size)
        sendPresence(
          { dragging: [...dragPositions.current.values()] },
          !nextMoving.size,
        )
      save(
        {
          ...graph,
          nodes: graph.nodes.map((n) => {
            const pos = positions.find((c) => c.id === n.id)?.position
            const size = dimensions.find((c) => c.id === n.id)?.dimensions
            return pos || size
              ? {
                  ...n,
                  ...(pos ? { position: pos } : {}),
                  ...(size ? { width: size.width, height: size.height } : {}),
                }
              : n
          }),
        },
        false,
      )
    },
    [setSelection, moving, dragPositions, setMoving, sendPresence, save, graph],
  )
  return { onNodesChange }
}
