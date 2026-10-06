import type { Wireframe } from '../types/wireframe.ts'
export function removeWireNodes(
  graph: Wireframe,
  selected: Set<string>,
): Wireframe {
  const ids = new Set(selected)
  for (const node of graph.nodes)
    if (node.parentId && ids.has(node.parentId)) ids.add(node.id)
  return {
    nodes: graph.nodes.filter((n) => !ids.has(n.id)),
    edges: graph.edges.filter((e) => !ids.has(e.source) && !ids.has(e.target)),
  }
}
