import type { Edge } from '@xyflow/react'
import type { DesignLibraryGraphInput } from '../types/designLibraryGraphInput.ts'
import type { DesignLibraryGraphNode } from '../types/designLibraryGraphNode.ts'

export function designLibraryGraph(
  model: DesignLibraryGraphInput,
) {
  const { library, pages, usage, libraryQuery, libraryKind, libraryAsset } =
    model
  const nodes: DesignLibraryGraphNode[] = []
  const counts = new Map<string, number>()
  const links = new Map<string, Edge>()
  for (const use of usage) {
    const source = `${use.assetKind}:${use.assetId}`
    const target = `${use.ownerKind}:${use.ownerId}`
    counts.set(source, (counts.get(source) || 0) + 1)
    const id = JSON.stringify([source, target])
    links.set(id, { id, source, target, type: 'smoothstep' })
  }
  const add = (
    kind: DesignLibraryGraphNode['data']['kind'],
    assets: { id: string; name: string; icon?: string }[],
  ) => {
    for (const asset of assets)
      nodes.push({
        id: `${kind}:${asset.id}`,
        type: 'asset',
        position: { x: 0, y: 0 },
        selected: libraryAsset === `${kind}:${asset.id}`,
        data: {
          label: asset.name,
          kind,
          assetId: asset.id,
          icon: asset.icon,
          count: counts.get(`${kind}:${asset.id}`) || 0,
        },
      })
  }
  add('variable', Object.values(library.variables))
  add('component', Object.values(library.components))
  add('machine', Object.values(library.machines))
  add('page', pages)
  const ids = new Set(nodes.map((node) => node.id))
  const edges = [...links.values()].filter(
    (e) => ids.has(e.source) && ids.has(e.target),
  )
  const query = libraryQuery.trim().toLocaleLowerCase()
  const matches = new Set(
    nodes
      .filter(
        (node) =>
          (libraryKind === 'all' || node.data.kind === libraryKind) &&
          `${node.data.label} ${node.data.assetId}`
            .toLocaleLowerCase()
            .includes(query),
      )
      .map((node) => node.id),
  )
  const visible = new Set(matches)
  for (const edge of edges) {
    if (matches.has(edge.source)) visible.add(edge.target)
    if (matches.has(edge.target)) visible.add(edge.source)
  }
  const rows = { variable: 0, component: 0, machine: 0, page: 0 }
  const columns = { variable: 0, component: 1, machine: 2, page: 3 }
  const filtered = nodes.filter((node) => visible.has(node.id))
  for (const node of filtered) {
    node.position = {
      x: columns[node.data.kind] * 290,
      y: rows[node.data.kind],
    }
    rows[node.data.kind] += Math.max(
      86,
      Math.ceil(node.data.label.length / 22) * 20 + 56,
    )
    node.style = { opacity: matches.has(node.id) ? 1 : 0.55 }
  }
  return {
    nodes: filtered,
    edges: edges.filter((e) => visible.has(e.source) && visible.has(e.target)),
  }
}
