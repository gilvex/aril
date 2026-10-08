import type { DesignElement } from '../../design/types/designElement.ts'
import type { DesignLibrary } from '../types/designLibrary.ts'
export function syncDesignInstances(
  nodes: DesignElement[],
  library: DesignLibrary,
): DesignElement[] {
  const result = nodes.filter((node) => !node.instance)
  const groups = new Map<string, DesignElement[]>()
  for (const node of nodes)
    if (node.instance)
      groups.set(node.instance.instanceId, [
        ...(groups.get(node.instance.instanceId) || []),
        node,
      ])
  for (const [instanceId, members] of groups) {
    const root =
      members.find((n) => !members.some((m) => m.id === n.parentId)) ||
      members[0]
    const link = root.instance!
    const variant =
      library.components[link.componentId]?.variants[link.variantId]
    if (!variant) {
      result.push(...members.map((n) => ({ ...n, instance: undefined })))
      continue
    }
    const reserved = new Set(nodes.map((n) => n.id))
    let sequence = 0
    const ids = new Map<string, string>()
    for (const source of variant.nodes) {
      const old = members.find((n) => n.instance?.sourceId === source.id)
      let id = old?.id
      while (!id || (!old && reserved.has(id)))
        id = `${instanceId}:new:${sequence++}`
      reserved.add(id)
      ids.set(source.id, id)
    }
    for (const source of variant.nodes) {
      const old = members.find((n) => n.instance?.sourceId === source.id)
      const overrides =
        old?.instance?.overrides ||
        (source.parentId ? [] : ['x', 'y', 'order', 'parentId'])
      const changes = Object.fromEntries(
        overrides
          .filter((key) => old && Object.hasOwn(old, key))
          .map((key) => [key, old![key as keyof DesignElement]]),
      )
      result.push({
        ...source,
        id: ids.get(source.id)!,
        parentId: source.parentId ? ids.get(source.parentId) : root.parentId,
        maskId: source.maskId ? ids.get(source.maskId) : undefined,
        ...(!source.parentId
          ? { x: root.x, y: root.y, order: root.order }
          : {}),
        ...changes,
        instance: { ...link, sourceId: source.id, overrides },
      })
    }
  }
  const present = new Set(result.map((n) => n.id))
  return result.map((node) => ({
    ...node,
    parentId:
      node.parentId && present.has(node.parentId) ? node.parentId : undefined,
    maskId: node.maskId && present.has(node.maskId) ? node.maskId : undefined,
  }))
}
