import { designAssetOrganization } from '@aril/domain/designLibrary'
import type { DesignLibraryGraphInput } from '../types/designLibraryGraphInput.ts'
import type { LibraryMapAsset } from '../types/libraryMapAsset.ts'
import { componentGlyph } from './componentGlyph.ts'
export function libraryMapAssets({
  library,
  pages,
  usage,
}: Pick<
  DesignLibraryGraphInput,
  'library' | 'pages' | 'usage'
>): LibraryMapAsset[] {
  const counts = new Map<string, number>()
  for (const use of usage) {
    if (use.ownerKind === 'machine') continue
    const key = use.assetKind + ':' + use.assetId
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  const result: LibraryMapAsset[] = []
  const add = (
    kind: LibraryMapAsset['kind'],
    entries: {
      id: string
      name: string
      icon?: string
      collectionId?: string
      organization?: { library: string; family: string }
    }[],
  ) => {
    for (const asset of entries)
      result.push({
        id: kind + ':' + asset.id,
        assetId: asset.id,
        kind,
        name: asset.name,
        icon: asset.icon,
        glyph:
          kind === 'component'
            ? componentGlyph(library.components[asset.id])
            : undefined,
        ...designAssetOrganization(
          kind,
          asset,
          library.collections[asset.collectionId || '']?.name,
        ),
        count: counts.get(kind + ':' + asset.id) || 0,
      })
  }
  add('variable', Object.values(library.variables))
  add('component', Object.values(library.components))
  add('page', pages)
  return result.sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  )
}
