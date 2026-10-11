/** Effective grouping for old assets, without rewriting user names or IDs. */
export function designAssetOrganization(
  kind: string,
  asset: { name: string; organization?: { library: string; family: string } },
  collectionName?: string,
) {
  if (asset.organization) return asset.organization
  const prefix = asset.name.includes('/') ? asset.name.split('/')[0].trim() : ''
  return {
    library:
      kind === 'variable'
        ? 'Foundations'
        : kind === 'component'
          ? 'Core UI'
          : kind === 'machine'
            ? 'Behaviors'
            : 'Pages',
    family:
      prefix ||
      (kind === 'variable'
        ? collectionName || 'Variables'
        : kind === 'component'
          ? 'Components'
          : kind === 'machine'
            ? 'State machines'
            : 'Pages'),
  }
}
