import type { DesignElement } from '../types/designElement.ts'
export function designAncestors(nodes: DesignElement[], id: string) {
  const lookup = new Map(nodes.map((node) => [node.id, node]))
  const result: DesignElement[] = []
  const seen = new Set([id])
  let parentId = lookup.get(id)?.parentId
  while (parentId && !seen.has(parentId)) {
    const parent = lookup.get(parentId)
    if (!parent) break
    seen.add(parentId)
    result.push(parent)
    parentId = parent.parentId
  }
  return result
}
