import type { DesignElement } from '../types/designElement.ts'
import { designAncestors } from './designAncestors.ts'
export function applyDesignChanges(
  nodes: DesignElement[],
  changes: Record<string, Partial<DesignElement>>,
) {
  return nodes.map((node) => {
    let next = { ...node }
    for (const parent of designAncestors(nodes, node.id).reverse()) {
      const patch = changes[parent.id]
      if (parent.kind !== 'group' || !patch) continue
      const sx = (patch.width ?? parent.width) / parent.width
      const sy = (patch.height ?? parent.height) / parent.height
      next = {
        ...next,
        x: next.x * sx,
        y: next.y * sy,
        width: Math.max(16, Math.min(6000, next.width * sx)),
        height: Math.max(16, Math.min(6000, next.height * sy)),
      }
    }
    return { ...next, ...changes[node.id] }
  })
}
