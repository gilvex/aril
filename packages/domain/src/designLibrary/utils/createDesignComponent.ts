import type { DesignElement } from '../../design/types/designElement.ts'
import type { DesignComponent } from '../types/designComponent.ts'
import { designDescendants } from '../../design/utils/designDescendants.ts'
import { designPosition } from '../../design/utils/designPosition.ts'
import { makeDesignElement } from '../../design/utils/makeDesignElement.ts'
export function createDesignComponent(
  nodes: DesignElement[],
  selected: string[],
  id: string,
  name: string,
): DesignComponent {
  const included = designDescendants(nodes, selected)
  const source = nodes.filter((n) => included.has(n.id))
  if (!source.length || source.length >= 500)
    throw new Error('Select between 1 and 499 layers')
  const roots = source.filter((n) => !included.has(n.parentId || ''))
  const positions = roots.map((n) => ({ node: n, ...designPosition(nodes, n) }))
  const x = Math.min(...positions.map((n) => n.x)),
    y = Math.min(...positions.map((n) => n.y))
  const width = Math.max(...positions.map((n) => n.x + n.node.width)) - x,
    height = Math.max(...positions.map((n) => n.y + n.node.height)) - y
  const rootId = `${id}:root`
  const template = source.map((n) => {
    const position = positions.find((p) => p.node.id === n.id)
    return {
      ...n,
      instance: undefined,
      ...(position
        ? { parentId: rootId, x: position.x - x, y: position.y - y }
        : {}),
    }
  })
  return {
    id,
    name,
    variants: {
      default: {
        id: 'default',
        name: 'Default',
        nodes: [
          makeDesignElement('group', rootId, {
            name,
            x: 0,
            y: 0,
            width,
            height,
            order: 0,
            fill: 'transparent',
            strokeWidth: 0,
          }),
          ...template,
        ],
      },
    },
  }
}
