import type { DesignElement } from '../types/designElement.ts'
import { designAncestors } from './designAncestors.ts'
import { makeDesignElement } from './makeDesignElement.ts'
import { designElementSchema } from '../config/designElementSchema.ts'
export function groupDesignElements(
  nodes: DesignElement[],
  ids: string[],
  id: string,
  name: string,
  mode: 'group' | 'frame' | 'mask' = 'group',
) {
  const selected = nodes
    .filter(
      (node) =>
        ids.includes(node.id) &&
        !designAncestors(nodes, node.id).some((parent) =>
          ids.includes(parent.id),
        ),
    )
    .sort((a, b) => a.order - b.order)
  const first = selected[0]
  if (
    !first ||
    nodes.length >= 500 ||
    selected.some(
      (node) =>
        node.parentId !== first.parentId ||
        node.locked ||
        designAncestors(nodes, node.id).some((parent) => parent.locked),
    )
  )
    return nodes
  if (
    mode === 'mask' &&
    (selected.length < 2 || !['rectangle', 'ellipse'].includes(first.kind))
  )
    return nodes
  const x = Math.min(...selected.map((node) => node.x)),
    y = Math.min(...selected.map((node) => node.y))
  const width = Math.max(...selected.map((node) => node.x + node.width)) - x
  const height = Math.max(...selected.map((node) => node.y + node.height)) - y
  if (width > 6000 || height > 6000) return nodes
  const container = makeDesignElement(
    mode === 'frame' ? 'frame' : 'group',
    id,
    {
      name,
      x,
      y,
      width,
      height,
      parentId: first.parentId,
      order: first.order,
      fill: 'transparent',
      strokeWidth: 0,
      ...(mode === 'mask' ? { maskId: first.id } : {}),
    },
  )
  return [
    ...nodes.map((node) =>
      selected.includes(node)
        ? { ...node, parentId: id, x: node.x - x, y: node.y - y }
        : selected.some((child) => child.id === node.maskId)
          ? { ...node, maskId: undefined }
          : node,
    ),
    designElementSchema.parse(container),
  ]
}
