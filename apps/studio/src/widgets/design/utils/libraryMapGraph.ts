import { MarkerType, type Edge } from '@xyflow/react'
import type { LibraryMapInput } from '../types/libraryMapInput.ts'
import type { LibraryMapNode } from '../types/libraryMapNode.ts'
import { libraryMapColor } from './libraryMapColor.ts'
import { libraryMapNeighborhood } from './libraryMapNeighborhood.ts'
import { libraryMapLayout } from './libraryMapLayout.ts'
export function libraryMapGraph(input: LibraryMapInput) {
  const { assets, edges, path, focus, depth, direction } = input
  const selected = assets.some((a) => a.id === input.selected)
    ? input.selected
    : null
  const query = input.query.trim().toLocaleLowerCase()
  const neighborhood = libraryMapNeighborhood(edges, selected, depth, direction)
  const matches = assets.filter(
    (a) =>
      (!path[0] || a.library === path[0]) &&
      (!path[1] || a.family === path[1]) &&
      (input.kind === 'all' || a.kind === input.kind) &&
      (input.usage === 'all' || a.count > 0 === (input.usage === 'used')) &&
      `${a.name} ${a.assetId} ${a.library} ${a.family}`
        .toLocaleLowerCase()
        .includes(query),
  )
  const filtered =
    focus && selected
      ? assets
          .filter((a) => neighborhood.has(a.id))
          .sort((a, b) => Number(b.id === selected) - Number(a.id === selected))
      : matches
  const individual = Boolean(
    input.individual || query || path.length >= 2 || (focus && selected),
  )
  const representatives = new Map<string, string>()
  const entries = new Map<string, LibraryMapNode>()
  for (const asset of filtered) {
    const nextPath = path.length
      ? [asset.library, asset.family]
      : [asset.library]
    const id = individual ? asset.id : `cluster:${JSON.stringify(nextPath)}`
    representatives.set(asset.id, id)
    const existing = entries.get(id)
    if (existing) {
      existing.data.count++
      continue
    }
    entries.set(id, {
      id,
      type: 'map',
      position: { x: 0, y: 0 },
      selected: id === selected,
      data: {
        label: individual ? asset.name : nextPath.at(-1)!,
        kind: individual ? asset.kind : 'cluster',
        count: individual ? asset.count : 1,
        color: libraryMapColor(asset.library),
        icon: asset.icon,
        ...(individual ? {} : { path: nextPath }),
      },
    })
  }
  const total = entries.size
  const pageSize = input.individual ? 60 : 24
  const offset = Math.min(
    input.offset,
    Math.max(0, Math.floor((total - 1) / pageSize) * pageSize),
  )
  const displayed = [...entries.values()].slice(offset, offset + pageSize)
  const displayIds = new Set(displayed.map((n) => n.id))
  const external = new Map<string, LibraryMapNode>()
  const links = new Map<string, Edge>()
  const assetIndex = new Map(assets.map((a) => [a.id, a]))
  for (const edge of edges) {
    if (
      focus &&
      selected &&
      (!neighborhood.has(edge.source) || !neighborhood.has(edge.target))
    )
      continue
    let source = representatives.get(edge.source),
      target = representatives.get(edge.target)
    const sourceVisible = source && displayIds.has(source),
      targetVisible = target && displayIds.has(target)
    if (!sourceVisible && !targetVisible) continue
    if (!sourceVisible || !targetVisible) {
      const missing = assetIndex.get(sourceVisible ? edge.target : edge.source)
      if (!missing) continue
      const id = `external:${JSON.stringify(missing.library)}`
      if (!external.has(id))
        external.set(id, {
          id,
          type: 'map',
          position: { x: 0, y: 0 },
          data: {
            label: missing.library,
            kind: 'cluster',
            count: 0,
            color: libraryMapColor(missing.library),
            path: [missing.library],
            external: true,
          },
        })
      external.get(id)!.data.count++
      if (sourceVisible) target = id
      else source = id
    }
    if (!source || !target || source === target) continue
    const id = JSON.stringify([source, target])
    const active =
      !selected ||
      (neighborhood.has(edge.source) && neighborhood.has(edge.target))
    const previous = links.get(id)
    links.set(id, {
      id,
      source,
      target,
      type: 'straight',
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--text-muted)' },
      style: {
        stroke: 'var(--text-muted)',
        strokeWidth: 1.25,
        opacity: active || previous?.style?.opacity === 0.6 ? 0.6 : 0.1,
      },
    })
  }
  // Bound external groups too; the catalog/search always retain the complete inventory.
  const nodes = [...displayed, ...[...external.values()].slice(0, 12)]
  const ids = new Set(nodes.map((n) => n.id))
  const visibleEdges = [...links.values()].filter(
    (e) => ids.has(e.source) && ids.has(e.target),
  )
  const highlighted = new Set<string>()
  for (const asset of assets)
    if (neighborhood.has(asset.id)) {
      highlighted.add(
        representatives.get(asset.id) ||
          `external:${JSON.stringify(asset.library)}`,
      )
    }
  const layout = libraryMapLayout(nodes, visibleEdges)
  return {
    nodes: layout.map((node) => ({
      ...node,
      style: {
        width: node.data.kind === 'cluster' ? 240 : 180,
        opacity: selected && !highlighted.has(node.id) ? 0.1 : 1,
      },
    })),
    edges: visibleEdges,
    total,
    pageSize,
    offset,
    matched: filtered.length,
    assets: filtered,
    externalOverflow: Math.max(0, external.size - 12),
  }
}
