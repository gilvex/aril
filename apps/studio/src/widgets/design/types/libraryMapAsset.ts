export type LibraryMapAsset = {
  id: string
  assetId: string
  kind: 'component' | 'variable' | 'machine' | 'page'
  name: string
  icon?: string
  library: string
  family: string
  count: number
}
