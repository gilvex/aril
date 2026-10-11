import type { DesignUsageInput } from '../types/designUsageInput.ts'
import type { DesignAssetSummary } from '../types/designAssetSummary.ts'
import { getDesignUsage } from './getDesignUsage.ts'
export function designAssetSummaries(
  design: DesignUsageInput,
): DesignAssetSummary[] {
  const counts = new Map<string, number>()
  for (const use of getDesignUsage(design)) {
    const key = `${use.assetKind}:${use.assetId}`
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  return [
    ...Object.values(design.library?.components || {}).map((a) => ({
      kind: 'component' as const,
      id: a.id,
      name: a.name,
      icon: a.icon,
      usageCount: counts.get(`component:${a.id}`) || 0,
    })),
    ...Object.values(design.library?.variables || {}).map((a) => ({
      kind: 'variable' as const,
      id: a.id,
      name: a.name,
      type: a.type,
      collectionId: a.collectionId,
      usageCount: counts.get(`variable:${a.id}`) || 0,
    })),
    ...Object.values(design.library?.machines || {}).map((a) => ({
      kind: 'machine' as const,
      id: a.id,
      name: a.name,
      usageCount: 0,
    })),
  ]
}
