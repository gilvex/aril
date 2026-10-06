import { useCallback } from 'react'
import type { UseWireframeConnectionsProps } from '../types/useWireframeConnectionsProps.ts'
export function useWireframeConnections({
  graph,
  save,
  setSelection,
  setEdgeId,
  setTargetId,
  selection,
}: UseWireframeConnectionsProps) {
  const connect = useCallback(
    (source: string, target: string, label = 'On click') => {
      if (
        source === target ||
        !graph.nodes.some((n) => n.id === source) ||
        !graph.nodes.some((n) => n.id === target) ||
        graph.edges.length >= 1500
      )
        return
      if (
        graph.edges.some(
          (e) =>
            e.source === source && e.target === target && e.label === label,
        )
      )
        return
      const id = crypto.randomUUID()
      save({
        ...graph,
        edges: [
          ...graph.edges,
          { id, source, target, label, type: 'smoothstep' },
        ],
      })
      setSelection(new Set())
      setEdgeId(id)
      setTargetId('')
    },
    [graph, save, setSelection, setEdgeId, setTargetId],
  )
  const duplicate = useCallback(() => {
    const ids = new Set(selection)
    for (const n of graph.nodes)
      if (n.parentId && ids.has(n.parentId)) ids.add(n.id)
    if (graph.nodes.length + ids.size > 500) return
    const newIds = new Map([...ids].map((id) => [id, crypto.randomUUID()]))
    const copies = graph.nodes
      .filter((n) => ids.has(n.id))
      .map((n) => ({
        ...structuredClone(n),
        id: newIds.get(n.id)!,
        ...(n.parentId
          ? { parentId: newIds.get(n.parentId) || n.parentId }
          : {}),
        position:
          n.parentId && ids.has(n.parentId)
            ? n.position
            : { x: n.position.x + 40, y: n.position.y + 40 },
        data: { ...n.data, title: (n.data.title + ' copy').slice(0, 120) },
      }))
    const copiedEdges = graph.edges
      .filter((e) => ids.has(e.source) && ids.has(e.target))
      .map((e) => ({
        ...e,
        id: crypto.randomUUID(),
        source: newIds.get(e.source)!,
        target: newIds.get(e.target)!,
      }))
    if (graph.edges.length + copiedEdges.length > 1500) return
    save({
      nodes: [...graph.nodes, ...copies],
      edges: [...graph.edges, ...copiedEdges],
    })
    setSelection(new Set([...selection].map((id) => newIds.get(id)!)))
  }, [selection, graph, save, setSelection])
  return { connect, duplicate }
}
