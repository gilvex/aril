import type { DesignLibrary } from '@pomegranate/domain/designLibrary'
export function designLibrarySummary(library?: DesignLibrary) {
  return library
    ? {
        components: Object.values(library.components).map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          variants: Object.values(c.variants).map((v) => ({
            id: v.id,
            name: v.name,
            layers: v.nodes.length,
          })),
        })),
        collections: Object.values(library.collections),
        variables: Object.values(library.variables).map((v) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          collectionId: v.collectionId,
        })),
        archivedMachineCount: Object.keys(library.machines).length,
      }
    : undefined
}
