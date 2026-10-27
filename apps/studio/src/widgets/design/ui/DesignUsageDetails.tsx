import { Text } from '@/shared/ui/Text.tsx'
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
      <Text as="p" className="library-usage-hint">
        {t('Select an asset to see where it is used.')}
      </Text>
    )
  return (
    <section className="library-usage-details">
      <Text as="h3">{asset.name}</Text>
      {kind === 'component' && <DesignComponentIcon model={model} />}
      <LibraryAssetPreview model={model} />
      <div className="design-library-buttons">
        <Button className="button" size="sm" variant="outline" onClick={edit}>
          <Text>{t('Open asset')}</Text>
        </Button>
        {kind === 'component' && (
          <Button
            className="button"
            size="sm"
            disabled={readOnly}
            onClick={insert}
          >
            <Text>{t('Insert instance')}</Text>
          </Button>
        )}
        <Button className="button" size="sm" variant="ghost" onClick={map}>
          <Text>{t('Show in map')}</Text>
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
        <ToggleGroupItem value="usedBy">
          <Text>{t('Used by')}</Text>
        </ToggleGroupItem>
        <ToggleGroupItem value="uses">
          <Text>{t('Uses assets')}</Text>
        </ToggleGroupItem>
        <ToggleGroupItem value="impact">
          <Text>{t('Impact')}</Text>
        </ToggleGroupItem>
      </ToggleGroup>
      <LibraryUsageList model={model} />
    </section>
  )
}
