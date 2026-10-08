import type { DesignComponent } from '../types/designComponent.ts'
import type { DesignElement } from '../../design/types/designElement.ts'
export function instantiateDesignComponent(
  component: DesignComponent,
  variantId: string,
  instanceId: string,
  point = { x: 0, y: 0 },
): DesignElement[] {
  const variant = component.variants[variantId]
  if (!variant) throw new Error('Component variant not found')
  const mapping = new Map(
    variant.nodes.map((node, index) => [node.id, `${instanceId}:${index}`]),
  )
  return variant.nodes.map((node) => ({
    ...node,
    id: mapping.get(node.id)!,
    parentId: node.parentId ? mapping.get(node.parentId) : undefined,
    maskId: node.maskId ? mapping.get(node.maskId) : undefined,
    x: node.parentId ? node.x : point.x,
    y: node.parentId ? node.y : point.y,
    instance: {
      componentId: component.id,
      variantId,
      instanceId,
      sourceId: node.id,
      overrides: node.parentId ? [] : ['x', 'y', 'order', 'parentId'],
    },
  }))
}
