import type { Edge } from '@xyflow/react'
import type { LibraryMapNode } from '../types/libraryMapNode.ts'
/** Stable, collision-free placement. Focus reads dependency → asset → usage. */
export function libraryMapLayout(
  nodes: LibraryMapNode[],
  edges: Edge[],
  selected?: string | null,
) {
  if (selected && nodes.some((n) => n.id === selected)) {
    const columns = new Map<string, number>([[selected, 0]])
    for (let depth = 1; depth <= 2; depth++) {
      const previous = new Map(columns)
      for (const edge of edges) {
        if (previous.has(edge.target) && !columns.has(edge.source))
          columns.set(edge.source, -depth)
        if (previous.has(edge.source) && !columns.has(edge.target))
          columns.set(edge.target, depth)
      }
    }
    const groups = new Map<number, LibraryMapNode[]>()
    for (const node of nodes) {
      const column = columns.get(node.id) ?? 3
      groups.set(column, [...(groups.get(column) || []), node])
    }
    return nodes.map((node) => {
      const column = columns.get(node.id) ?? 3,
        peers = groups.get(column)!
      return {
        ...node,
        position: {
          x: column * 300,
          y: (peers.indexOf(node) - (peers.length - 1) / 2) * 170,
        },
      }
    })
  }
  const columns = Math.max(1, Math.ceil(Math.sqrt(nodes.length * 1.3)))
  const rows = Math.ceil(nodes.length / columns)
  return nodes.map((node, index) => {
    const row = Math.floor(index / columns),
      col = index % columns
    const count = Math.min(columns, nodes.length - row * columns)
    return {
      ...node,
      position: {
        x: (col - (count - 1) / 2) * 255 + (row % 2 ? 24 : 0),
        y: (row - (rows - 1) / 2) * 180,
      },
    }
  })
}
