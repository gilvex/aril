export type DesignUsage = {
  assetKind: 'component' | 'variable'
  assetId: string
  ownerKind: 'page' | 'component' | 'machine'
  ownerId: string
  ownerName: string
  variantId?: string
  nodeId?: string
  nodeName?: string
  property?: string
  instanceId?: string
  stateId?: string
  transitionId?: string
}
