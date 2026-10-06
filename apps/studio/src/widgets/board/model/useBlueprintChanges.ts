import type { Idea } from '@pomegranate/domain/workspace'
import { type Node, type NodeChange } from '@xyflow/react'
import { useCallback } from 'react'
import type { UseBlueprintChangesProps } from '../types/useBlueprintChangesProps.ts'
export function useBlueprintChanges({
  setSelectedIds,
  setDimensions,
  board,
  localDragging,
  dragPositions,
  setLocalDragging,
  sendPresence,
  update,
}: UseBlueprintChangesProps) {
  const onNodesChange = useCallback(
    (changes: NodeChange<Node<Idea['data']>>[]) => {
      const selectionChanges = changes.filter((c) => c.type === 'select')
      if (selectionChanges.length)
        setSelectedIds((previous) => {
          const next = new Set(previous)
          for (const change of selectionChanges) {
            if (change.selected) next.add(change.id)
            else next.delete(change.id)
          }
          return next
        })
      const measurements = changes.filter((c) => c.type === 'dimensions')
      if (measurements.length)
        setDimensions((previous) => {
          const next = { ...previous }
          let changed = false
          for (const measurement of measurements) {
            if (
              measurement.dimensions &&
              (next[measurement.id]?.width !== measurement.dimensions.width ||
                next[measurement.id]?.height !== measurement.dimensions.height)
            ) {
              next[measurement.id] = measurement.dimensions
              changed = true
            }
          }
          return changed ? next : previous
        })
      const persisted = changes.filter((c) => c.type === 'position')
      if (!persisted.length) return
      // React Flow's `dragging` flag is transient UI state, not an undoable field.
      const positions = new Map(
        persisted.map((change) => [change.id, change.position]),
      )
      const nodes = board.nodes.map((node) => {
        const position = positions.get(node.id)
        return position ? { ...node, position } : node
      })
      const moving = new Set(localDragging)
      for (const change of persisted) {
        if (change.dragging === true) moving.add(change.id)
        if (change.dragging === false) moving.delete(change.id)
        if (
          change.position &&
          (change.dragging || dragPositions.current.has(change.id))
        )
          dragPositions.current.set(change.id, {
            id: change.id,
            position: change.position,
          })
      }
      setLocalDragging(moving)
      if (dragPositions.current.size)
        sendPresence(
          { dragging: [...dragPositions.current.values()] },
          !moving.size,
        )
      update(
        {
          ...board,
          nodes,
          edges: board.edges.filter(
            (e) =>
              nodes.some((n) => n.id === e.source) &&
              nodes.some((n) => n.id === e.target),
          ),
        },
        false,
      )
    },
    [
      setSelectedIds,
      setDimensions,
      board,
      localDragging,
      dragPositions,
      setLocalDragging,
      sendPresence,
      update,
    ],
  )
  return { onNodesChange }
}
