import type {
  DesignLibrary,
  DesignUsage,
} from '@aril/domain/designLibrary'
import { libraryIndirectUsage } from './libraryIndirectUsage.ts'
export function libraryUsageResults(
  usage: DesignUsage[],
  library: DesignLibrary,
  selected: string | null,
  query: string,
) {
  const match = query.trim().toLocaleLowerCase()
  const contains = (...values: (string | undefined)[]) =>
    values.filter(Boolean).join(' ').toLocaleLowerCase().includes(match)
  const active = usage.filter((u) => u.ownerKind !== 'machine')
  const uses = active.filter((u) => `${u.assetKind}:${u.assetId}` === selected)
  const groups = new Map<string, DesignUsage[]>()
  for (const use of uses) {
    if (
      !contains(
        use.ownerName,
        use.nodeName,
        use.property,
        use.variantId &&
          library.components[use.ownerId]?.variants[use.variantId]?.name,
      )
    )
      continue
    const id = `${use.ownerKind}:${use.ownerId}`
    const entries = groups.get(id) || []
    entries.push(use)
    groups.set(id, entries)
  }
  const dependencies = new Map<
    string,
    { id: string; name: string; kind: string; count: number }
  >()
  for (const use of active) {
    if (`${use.ownerKind}:${use.ownerId}` !== selected) continue
    const id = `${use.assetKind}:${use.assetId}`
    const name =
      (use.assetKind === 'component'
        ? library.components[use.assetId]
        : library.variables[use.assetId]
      )?.name || use.assetId
    if (!contains(name, use.nodeName, use.property)) continue
    const entry = dependencies.get(id) || {
      id,
      name,
      kind: use.assetKind,
      count: 0,
    }
    entry.count++
    dependencies.set(id, entry)
  }
  return {
    totalUses: uses.length,
    groups: [...groups.entries()],
    dependencies: [...dependencies.values()],
    indirect: libraryIndirectUsage(active, selected).filter((a) =>
      contains(a.name),
    ),
  }
}
