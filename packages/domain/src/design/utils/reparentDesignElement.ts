import type { DesignElement } from '../types/designElement.ts'
import { designDescendants } from './designDescendants.ts'
import { designPosition } from './designPosition.ts'
import { isDesignContainer } from './isDesignContainer.ts'
export function reparentDesignElement(
  nodes: DesignElement[],
  id: string,
  parentId?: string,
) {
  const node = nodes.find((item) => item.id === id)
  const parent = nodes.find((item) => item.id === parentId)
  if (
    !node ||
    node.locked ||
    (parentId &&
      (!isDesignContainer(parent) ||
        designDescendants(nodes, [id]).has(parentId)))
  )
    return nodes
  const absolute = designPosition(nodes, node)
  const origin = parent ? designPosition(nodes, parent) : { x: 0, y: 0 }
  return nodes.map((item) =>
    item.id === id
      ? {
          ...item,
          parentId,
          x: absolute.x - origin.x,
          y: absolute.y - origin.y,
        }
      : item.maskId === id && item.id !== parentId
        ? { ...item, maskId: undefined }
        : item,
  )
}
