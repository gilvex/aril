export type DesignAssetSummary = {
  kind: 'component' | 'variable' | 'machine'
  id: string
  name: string
  icon?: string
  type?: string
  collectionId?: string
  organization: { library: string; family: string }
  usageCount: number
}
