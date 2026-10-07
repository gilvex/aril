import type { DesignElement } from '../types/designElement.ts'
export function ungroupDesignElements(nodes: DesignElement[], id: string) {
  const group = nodes.find((node) => node.id === id)
  if (!group || group.kind !== 'group' || group.locked) return nodes
  const siblings = nodes
    .filter((node) => node.parentId === group.parentId)
    .sort((a, b) => a.order - b.order)
  const children = nodes
    .filter((node) => node.parentId === id)
    .sort((a, b) => a.order - b.order)
  const order = new Map(
    siblings
      .flatMap((node) => (node.id === id ? children : [node]))
      .map((node, index) => [node.id, index]),
  )
  return nodes
    .filter((node) => node.id !== id)
    .map((node) =>
      node.parentId === id
        ? {
            ...node,
            parentId: group.parentId,
            x: node.x + group.x,
            y: node.y + group.y,
          }
        : node,
    )
    .map((node) => ({ ...node, order: order.get(node.id) ?? node.order }))
}
