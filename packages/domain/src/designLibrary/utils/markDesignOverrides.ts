import type { DesignElement } from '../../design/types/designElement.ts'
export function markDesignOverrides(
  previous: DesignElement[],
  next: DesignElement[],
) {
  return next.map((node) => {
    const before = previous.find((n) => n.id === node.id)
    if (!node.instance || !before) return node
    const removedMember = previous.some(
      (n) =>
        n.instance?.instanceId === node.instance!.instanceId &&
        !next.some((item) => item.id === n.id),
    )
    if (removedMember) return { ...node, instance: undefined }
    const keys = Object.keys(node).filter(
      (key) =>
        !['id', 'instance', 'maskId', 'clipContent', 'kind'].includes(key) &&
        JSON.stringify(node[key as keyof DesignElement]) !==
          JSON.stringify(before[key as keyof DesignElement]),
    )
    return {
      ...node,
      instance: {
        ...node.instance,
        overrides: [
          ...new Set([...node.instance.overrides, ...keys]),
        ] as NonNullable<DesignElement['instance']>['overrides'],
      },
    }
  })
}
