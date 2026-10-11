import { MarkerType, type Edge } from '@xyflow/react'
import type { LibraryMapExpansionInput } from '../types/libraryMapExpansionInput.ts'
import type { LibraryMapNode } from '../types/libraryMapNode.ts'
import { libraryExpansionPosition } from './libraryExpansionPosition.ts'
import { libraryMapColor } from './libraryMapColor.ts'
/** Expand real members in place; aggregate edges remain for unrevealed members. */
export function expandLibraryMap({
  nodes: original,
  edges,
  input,
  highlighted,
}: LibraryMapExpansionInput) {
  const expanded = input.expanded || {}
  if (!Object.keys(expanded).length) return { nodes: original, edges }
  const nodes = original.map((node) => ({
    ...node,
    data: { ...node.data },
    position: input.positions?.[node.id] || node.position,
  }))
  const assets = new Map(input.assets.map((asset) => [asset.id, asset]))
  const represented = new Map<string, string>()
  for (const node of nodes) {
    if (node.data.members)
      for (const id of node.data.members) represented.set(id, node.id)
    else represented.set(node.id, node.id)
  }
  const known = new Set(nodes.map((node) => node.id))
  for (const [id, limit] of Object.entries(expanded)) {
    const anchor = nodes.find((node) => node.id === id)
    if (!anchor?.data.members || limit <= 0) continue
    const members = anchor.data.members.filter((member) => assets.has(member))
    anchor.data.expanded = true
    for (const member of members.slice(0, limit)) {
      represented.set(member, member)
      if (known.has(member)) continue
      const asset = assets.get(member)!
      nodes.push({
        id: member,
        type: 'map',
        selected: input.selected === member,
        position:
          input.positions?.[member] || libraryExpansionPosition(anchor, nodes),
        data: {
          label: asset.name,
          kind: asset.kind,
          count: asset.count,
          color: libraryMapColor(asset.library),
          icon: asset.icon,
          glyph: asset.glyph,
        },
        style: {
          width: 180,
          opacity: input.selected && !highlighted.has(member) ? 0.1 : 1,
        },
      })
      known.add(member)
    }
    if (members.length > limit) {
      const more: LibraryMapNode = {
        id: `more:${id}`,
        type: 'map',
        position: libraryExpansionPosition(anchor, nodes),
        data: {
          label: '',
          kind: 'more',
          count: members.length - limit,
          color: anchor.data.color,
          moreFor: id,
        },
        style: { width: 180 },
      }
      nodes.push(more)
    }
  }
  const links = new Map<string, Edge>()
  for (const edge of input.edges) {
    const source = represented.get(edge.source),
      target = represented.get(edge.target)
    if (!source || !target || source === target) continue
    const id = JSON.stringify([source, target])
    const active =
      !input.selected ||
      (highlighted.has(edge.source) && highlighted.has(edge.target))
    const previous = links.get(id)
    links.set(id, {
      id,
      source,
      target,
      type: 'library',
      markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--text-muted)' },
      style: {
        stroke: 'var(--text-muted)',
        strokeWidth: input.selected && active ? 1.8 : 1.2,
        opacity: active || previous?.style?.opacity === 0.6 ? 0.6 : 0.1,
      },
    })
  }
  return { nodes, edges: [...links.values()] }
}
