import type { DesignElement } from '../types/designElement.ts'
export function designDescendants(nodes: DesignElement[], selected: string[]) {
  const ids = new Set(selected)
  for (let size = -1; size !== ids.size;) {
    size = ids.size
    for (const node of nodes)
      if (node.parentId && ids.has(node.parentId)) ids.add(node.id)
  }
  return ids
}
