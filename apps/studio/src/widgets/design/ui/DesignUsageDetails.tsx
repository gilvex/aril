import { useCallback } from 'react'
import { Button } from 'vagabond-ui/button'
import { ToggleGroup, ToggleGroupItem } from 'vagabond-ui/toggle-group'
import { useDesignUsageDetails } from '../model/useDesignUsageDetails.ts'
import { LibraryAssetPreview } from './LibraryAssetPreview.tsx'
import { LibraryUsageList } from './LibraryUsageList.tsx'
import { DesignComponentIcon } from './DesignComponentIcon.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignUsageDetails({ model }: DesignEditorProps) {
  const { t, readOnly, kind, asset, edit, insert, patch } =
    useDesignUsageDetails(model)
  const map = useCallback(
    () => patch({ libraryTab: 'graph', libraryFocus: true, libraryOffset: 0 }),
    [patch],
  )
  const selectConnection = useCallback(
    (value: string) => {
      if (value === 'usedBy' || value === 'uses' || value === 'impact')
        patch({ libraryDetailsTab: value, libraryUsageLimit: 50 })
    },
    [patch],
  )
  if (!asset)
    return (
      <p className="library-usage-hint">
        {t('Select an asset to see where it is used.')}
      </p>
    )
  return (
    <section className="library-usage-details">
      <h3>{asset.name}</h3>
      {kind === 'component' && <DesignComponentIcon model={model} />}
      <LibraryAssetPreview model={model} />
      <div className="design-library-buttons">
        <Button className="button" size="sm" variant="outline" onClick={edit}>
          {t('Open asset')}
        </Button>
        {kind === 'component' && (
          <Button
            className="button"
            size="sm"
            disabled={readOnly}
            onClick={insert}
          >
            {t('Insert instance')}
          </Button>
        )}
        <Button className="button" size="sm" variant="ghost" onClick={map}>
          {t('Show in map')}
        </Button>
      </div>
      <ToggleGroup
        data-studio-toggle-group
        type="single"
        value={model.libraryDetailsTab}
        onValueChange={selectConnection}
        className="library-detail-tabs"
        aria-label={t('Asset connections')}
      >
        <ToggleGroupItem value="usedBy">{t('Used by')}</ToggleGroupItem>
        <ToggleGroupItem value="uses">{t('Uses assets')}</ToggleGroupItem>
        <ToggleGroupItem value="impact">{t('Impact')}</ToggleGroupItem>
      </ToggleGroup>
      <LibraryUsageList model={model} />
    </section>
  )
}
