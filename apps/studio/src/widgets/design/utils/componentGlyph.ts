import { designPosition } from '@aril/domain/design'
import type { DesignComponent } from '@aril/domain/designLibrary'
import type { ComponentGlyph } from '../types/componentGlyph.ts'
/** A bounded monochrome silhouette, derived from actual geometry rather than names. */
export function componentGlyph(component: DesignComponent): ComponentGlyph {
  const nodes = Object.values(component.variants)[0]?.nodes || []
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const visible = nodes.filter((node) => {
    const seen = new Set<string>()
    let current: typeof node | undefined = node
    while (current) {
      if (current.hidden || seen.has(current.id)) return false
      seen.add(current.id)
      current = current.parentId ? byId.get(current.parentId) : undefined
    }
    return true
  })
  const root = visible.find((n) => !n.parentId)
  if (!root) return []
  const origin = designPosition(nodes, root)
  const scale = 24 / Math.max(1, root.width, root.height)
  const left = (32 - root.width * scale) / 2,
    top = (32 - root.height * scale) / 2
  return visible.slice(0, 20).map((node) => {
    const position = designPosition(nodes, node)
    return {
      kind:
        node.kind === 'ellipse'
          ? 'ellipse'
          : node.kind === 'text'
            ? 'text'
            : 'rect',
      x: left + (position.x - origin.x) * scale,
      y: top + (position.y - origin.y) * scale,
      width: Math.max(1, node.width * scale),
      height: Math.max(1, node.height * scale),
      radius: Math.min(4, node.radius * scale),
    }
  })
}
