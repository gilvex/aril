import type { DesignUsage } from '../types/designUsage.ts'
import type { DesignUsageInput } from '../types/designUsageInput.ts'
import type { DesignElement } from '../../design/types/designElement.ts'

/** Direct references, with component instances counted once per variant/page. */
export function getDesignUsage(design: DesignUsageInput): DesignUsage[] {
  const result: DesignUsage[] = []
  const scan = (
    nodes: DesignElement[],
    owner: Pick<
      DesignUsage,
      'ownerKind' | 'ownerId' | 'ownerName' | 'variantId'
    >,
  ) => {
    const instances = new Set<string>()
    for (const node of nodes) {
      const instance = node.instance
      if (instance && !instances.has(instance.instanceId)) {
        instances.add(instance.instanceId)
        const root =
          nodes.find(
            (n) =>
              n.instance?.instanceId === instance.instanceId &&
              !nodes.some(
                (p) =>
                  p.id === n.parentId &&
                  p.instance?.instanceId === instance.instanceId,
              ),
          ) || node
        result.push({
          ...owner,
          assetKind: 'component',
          assetId: instance.componentId,
          nodeId: root.id,
          nodeName: root.name,
          instanceId: instance.instanceId,
        })
      }
      for (const [property, assetId] of Object.entries(node.bindings || {})) {
        if (assetId)
          result.push({
            ...owner,
            assetKind: 'variable',
            assetId,
            nodeId: node.id,
            nodeName: node.name,
            property,
          })
      }
    }
  }
  for (const page of design.pages || [])
    scan(page.nodes, {
      ownerKind: 'page',
      ownerId: page.id,
      ownerName: page.name,
    })
  for (const component of Object.values(design.library?.components || {}))
    for (const variant of Object.values(component.variants))
      scan(variant.nodes, {
        ownerKind: 'component',
        ownerId: component.id,
        ownerName: component.name,
        variantId: variant.id,
      })
  for (const machine of Object.values(design.library?.machines || {})) {
    const owner = {
      ownerKind: 'machine' as const,
      ownerId: machine.id,
      ownerName: machine.name,
    }
    if (machine.componentId)
      result.push({
        ...owner,
        assetKind: 'component',
        assetId: machine.componentId,
        property: 'componentId',
      })
    for (const state of Object.values(machine.states))
      for (const action of state.entry)
        result.push({
          ...owner,
          assetKind: 'variable',
          assetId: action.variableId,
          stateId: state.id,
          property: 'entry',
        })
    for (const transition of Object.values(machine.transitions)) {
      if (transition.guard)
        result.push({
          ...owner,
          assetKind: 'variable',
          assetId: transition.guard.variableId,
          transitionId: transition.id,
          property: 'guard',
        })
      for (const action of transition.actions)
        result.push({
          ...owner,
          assetKind: 'variable',
          assetId: action.variableId,
          transitionId: transition.id,
          property: 'actions',
        })
    }
  }
  return result
}
