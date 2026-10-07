import {
  designAncestors,
  designPosition,
  type DesignElement,
} from '@pomegranate/domain/design'
export function designClipShapes(nodes: DesignElement[], node: DesignElement) {
  const origin = designPosition(nodes, node)
  return designAncestors(nodes, node.id).flatMap((parent) => {
    const shape = parent.maskId
      ? nodes.find((item) => item.id === parent.maskId)
      : parent.clipContent
        ? parent
        : undefined
    if (!shape || shape.id === node.id) return []
    const position = designPosition(nodes, shape)
    return [{ ...shape, x: position.x - origin.x, y: position.y - origin.y }]
  })
}
