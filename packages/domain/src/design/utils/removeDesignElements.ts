import type { DesignElement } from '../types/designElement.ts'

export function removeDesignElements(
  nodes: DesignElement[],
  selected: string[],
) {
  const ids = new Set(selected)
  return nodes.filter(
    (node) => !ids.has(node.id) && !ids.has(node.parentId || ''),
  )
}
