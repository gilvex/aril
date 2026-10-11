export type DesignAssetSummary = {
  kind: 'component' | 'variable' | 'machine'
  id: string
  name: string
  icon?: string
  type?: string
  collectionId?: string
  usageCount: number
}
