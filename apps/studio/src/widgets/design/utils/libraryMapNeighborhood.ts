import type { Edge } from '@xyflow/react'
export function libraryMapNeighborhood(
  edges: Edge[],
  selected: string | null,
  depth = 1,
  direction = 'both',
) {
  const result = new Set(selected ? [selected] : [])
  for (let level = 0; selected && level < depth; level++) {
    const previous = new Set(result)
    for (const edge of edges) {
      if (direction !== 'uses' && previous.has(edge.source))
        result.add(edge.target)
      if (direction !== 'usedBy' && previous.has(edge.target))
        result.add(edge.source)
    }
  }
  return result
}
