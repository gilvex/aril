import type { DesignElement } from '../types/designElement.ts'
import { designAncestors } from './designAncestors.ts'
export function normalizeDesignGroups(nodes: DesignElement[]) {
  let result = nodes
  const groups = nodes
    .filter((node) => node.kind === 'group')
    .sort(
      (a, b) =>
        designAncestors(nodes, b.id).length -
        designAncestors(nodes, a.id).length,
    )
  for (const original of groups) {
    const group = result.find((node) => node.id === original.id)!
    const children = result.filter((node) => node.parentId === group.id)
    if (!children.length) continue
    const x = Math.min(...children.map((node) => node.x)),
      y = Math.min(...children.map((node) => node.y))
    const width = Math.max(...children.map((node) => node.x + node.width)) - x
    const height = Math.max(...children.map((node) => node.y + node.height)) - y
    if (width > 6000 || height > 6000) continue
    result = result.map((node) =>
      node.id === group.id
        ? { ...node, x: node.x + x, y: node.y + y, width, height }
        : node.parentId === group.id
          ? { ...node, x: node.x - x, y: node.y - y }
          : node,
    )
  }
  return result
}
