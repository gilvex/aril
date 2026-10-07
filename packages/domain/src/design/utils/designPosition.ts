import type { DesignElement } from '../types/designElement.ts'
import { designAncestors } from './designAncestors.ts'
export function designPosition(nodes: DesignElement[], node: DesignElement) {
  return designAncestors(nodes, node.id).reduce(
    (position, parent) => ({
      x: position.x + parent.x,
      y: position.y + parent.y,
    }),
    { x: node.x, y: node.y },
  )
}
