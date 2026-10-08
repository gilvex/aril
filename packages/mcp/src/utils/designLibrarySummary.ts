import type { DesignLibrary } from '@pomegranate/domain/designLibrary'
export function designLibrarySummary(library?: DesignLibrary) {
  return library
    ? {
        components: Object.values(library.components).map((c) => ({
          id: c.id,
          name: c.name,
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
        machines: Object.values(library.machines).map((m) => ({
          id: m.id,
          name: m.name,
          states: Object.keys(m.states).length,
          transitions: Object.keys(m.transitions).length,
        })),
      }
    : undefined
}
