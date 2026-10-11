import { useCallback } from 'react'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useDesignUsageDetails } from '../model/useDesignUsageDetails.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import { LibraryAssetIdentity } from './LibraryAssetIdentity.tsx'
import { LibraryAssetOverview } from './LibraryAssetOverview.tsx'
import { LibraryAssetUsage } from './LibraryAssetUsage.tsx'
import { LibraryOrganization } from './LibraryOrganization.tsx'
export function LibraryInspectorContent({
  model,
  explorer,
}: LibraryExplorerProps) {
  const { t } = useTranslation()
  const { asset, uses } = useDesignUsageDetails(model)
  const { patch } = model
  const view = useCallback(
    (value: string) => {
      if (value === 'details' || value === 'usage')
        patch({ libraryInspectorView: value })
    },
    [patch],
  )
  if (model.librarySelection.length > 1)
    return (
      <div className="library-details-body">
        <h3>
          {t('Organize {{count}} assets', {
            count: model.librarySelection.length,
          })}
        </h3>
        <LibraryOrganization model={model} explorer={explorer} />
      </div>
    )
  if (!asset)
    return (
      <p className="asset-empty">
        {t('Select an asset to see where it is used.')}
      </p>
    )
  return (
    <>
      <LibraryAssetIdentity model={model} explorer={explorer} />
      <ToggleGroup
        data-studio-toggle-group
        type="single"
        value={model.libraryInspectorView}
        onValueChange={view}
        className="asset-view-switch"
        aria-label={t('Asset detail view')}
      >
        <ToggleGroupItem value="details">{t('Details')}</ToggleGroupItem>
        <ToggleGroupItem value="usage">
          {t('Usage')}
          <span className="asset-count">{uses.length}</span>
        </ToggleGroupItem>
      </ToggleGroup>
      <div className="library-details-body" key={model.libraryAsset}>
        {model.libraryInspectorView === 'details' ? (
          <LibraryAssetOverview model={model} explorer={explorer} />
        ) : (
          <LibraryAssetUsage model={model} />
        )}
      </div>
    </>
  )
}
