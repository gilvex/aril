import {
  designAncestors,
  designPosition,
  type DesignElement,
} from '@pomegranate/domain/design'
export function alignDesignLayers(
  nodes: DesignElement[],
  ids: string[],
  axis: 'x' | 'y',
  edge: 'start' | 'center' | 'end',
) {
  const targets = nodes.filter(
    (node) =>
      ids.includes(node.id) &&
      !designAncestors(nodes, node.id).some(
        (parent) => ids.includes(parent.id) || parent.locked,
      ) &&
      !node.locked,
  )
  if (!targets.length) return nodes
  const size = axis === 'x' ? 'width' : 'height'
  const absolute = (node: DesignElement) => designPosition(nodes, node)[axis]
  const parent =
    targets.length === 1
      ? nodes.find((node) => node.id === targets[0].parentId)
      : undefined
  if (targets.length === 1 && !parent) return nodes
  const start = parent ? absolute(parent) : Math.min(...targets.map(absolute))
  const end = parent
    ? start + parent[size]
    : Math.max(...targets.map((node) => absolute(node) + node[size]))
  return nodes.map((node) =>
    targets.includes(node)
      ? {
          ...node,
          [axis]:
            (edge === 'start'
              ? start
              : edge === 'end'
                ? end - node[size]
                : (start + end - node[size]) / 2) -
            (absolute(node) - node[axis]),
        }
      : node,
  )
}
