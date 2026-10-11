import { useMemo } from 'react'
import type { Edge } from '@xyflow/react'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
import { libraryMapAssets } from '../utils/libraryMapAssets.ts'
import { libraryMapGraph } from '../utils/libraryMapGraph.ts'
export function useLibraryExplorer(model: DesignEditorModel) {
  const {
    library,
    design,
    usage,
    libraryPath: path,
    libraryQuery: query,
    libraryKind: kind,
    libraryUsage: filter,
    libraryAsset: selected,
    libraryFocus: focus,
    libraryDepth: depth,
    libraryDirection: direction,
    libraryOffset: offset,
    libraryTab,
  } = model
  const assets = useMemo(
    () => libraryMapAssets({ library, pages: design.pages || [], usage }),
    [library, design.pages, usage],
  )
  const edges = useMemo(() => {
    const ids = new Set(assets.map((a) => a.id))
    const result = new Map<string, Edge>()
    for (const use of usage) {
      const source = `${use.assetKind}:${use.assetId}`,
        target = `${use.ownerKind}:${use.ownerId}`
      const id = JSON.stringify([source, target])
      if (ids.has(source) && ids.has(target))
        result.set(id, { id, source, target })
    }
    return [...result.values()]
  }, [assets, usage])
  const graph = useMemo(
    () =>
      libraryMapGraph({
        assets,
        edges,
        path,
        query,
        kind,
        usage: filter,
        selected,
        focus,
        depth,
        direction,
        offset,
        individual: libraryTab === 'browse',
      }),
    [
      assets,
      edges,
      path,
      query,
      kind,
      filter,
      selected,
      focus,
      depth,
      direction,
      offset,
      libraryTab,
    ],
  )
  const groups = useMemo(() => {
    const result = new Map<
      string,
      { name: string; count: number; families: Map<string, number> }
    >()
    for (const asset of assets) {
      const group = result.get(asset.library) || {
        name: asset.library,
        count: 0,
        families: new Map<string, number>(),
      }
      group.count++
      group.families.set(
        asset.family,
        (group.families.get(asset.family) || 0) + 1,
      )
      result.set(asset.library, group)
    }
    return [...result.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [assets])
  return { assets, edges, graph, groups }
}
