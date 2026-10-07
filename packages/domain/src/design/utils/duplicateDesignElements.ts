import type { DesignElement } from '../types/designElement.ts'

export function duplicateDesignElements(
  nodes: DesignElement[],
  selected: string[],
  id: () => string,
) {
  const ids = new Set(selected)
  const source = nodes.filter(
    (node) => ids.has(node.id) || ids.has(node.parentId || ''),
  )
  const mapping = new Map(source.map((node) => [node.id, id()]))
  const order = Math.max(0, ...nodes.map((node) => node.order)) + 1
  return source.map((node, index) => {
    const parentId = mapping.get(node.parentId || '') || node.parentId
    const movedParent = mapping.has(node.parentId || '')
    return {
      ...node,
      id: mapping.get(node.id)!,
      parentId,
      order: order + index,
      x: node.x + (movedParent ? 0 : 32),
      y: node.y + (movedParent ? 0 : 32),
    }
  })
}
