import type { DesignElement } from '@pomegranate/domain/design'
export function alignDesignLayers(
  nodes: DesignElement[],
  ids: string[],
  axis: 'x' | 'y',
  edge: 'start' | 'center' | 'end',
) {
  const targets = nodes.filter(
    (node) =>
      ids.includes(node.id) &&
      !ids.includes(node.parentId || '') &&
      !node.locked,
  )
  if (!targets.length) return nodes
  const size = axis === 'x' ? 'width' : 'height'
  const absolute = (node: DesignElement) =>
    node[axis] +
    (nodes.find((parent) => parent.id === node.parentId)?.[axis] || 0)
  const parent =
    targets.length === 1
      ? nodes.find((node) => node.id === targets[0].parentId)
      : undefined
  if (targets.length === 1 && !parent) return nodes
  const start = parent ? parent[axis] : Math.min(...targets.map(absolute))
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
            (nodes.find((item) => item.id === node.parentId)?.[axis] || 0),
        }
      : node,
  )
}
