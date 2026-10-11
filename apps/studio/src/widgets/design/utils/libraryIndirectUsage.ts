import type { DesignUsage } from '@pomegranate/domain/designLibrary'
export function libraryIndirectUsage(
  usage: DesignUsage[],
  selected: string | null,
) {
  if (!selected) return []
  const adjacency = new Map<string, Map<string, string>>()
  for (const use of usage) {
    const key = `${use.assetKind}:${use.assetId}`
    const neighbors = adjacency.get(key) || new Map<string, string>()
    neighbors.set(`${use.ownerKind}:${use.ownerId}`, use.ownerName)
    adjacency.set(key, neighbors)
  }
  const direct = adjacency.get(selected) || new Map<string, string>()
  const visited = new Set([selected, ...direct.keys()])
  const queue = [...direct.keys()]
  const result: { id: string; name: string }[] = []
  for (let i = 0; i < queue.length; i++) {
    for (const [id, name] of adjacency.get(queue[i]) || []) {
      if (visited.has(id)) continue
      visited.add(id)
      queue.push(id)
      result.push({ id, name })
    }
  }
  return result
}
