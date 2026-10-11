import { useCallback } from 'react'
import { Button } from 'vagabond-ui/button'
import { useDesignUsageDetails } from '../model/useDesignUsageDetails.ts'
import { LibraryAssetPreview } from './LibraryAssetPreview.tsx'
import { LibraryUsageList } from './LibraryUsageList.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignUsageDetails({ model }: DesignEditorProps) {
  const { t, readOnly, kind, asset, edit, insert, patch } =
    useDesignUsageDetails(model)
  const map = useCallback(
    () => patch({ libraryTab: 'graph', libraryFocus: true, libraryOffset: 0 }),
    [patch],
  )
  const usedBy = useCallback(
    () => patch({ libraryDetailsTab: 'usedBy', libraryUsageLimit: 50 }),
    [patch],
  )
  const uses = useCallback(
    () => patch({ libraryDetailsTab: 'uses', libraryUsageLimit: 50 }),
    [patch],
  )
  const impact = useCallback(
    () => patch({ libraryDetailsTab: 'impact', libraryUsageLimit: 50 }),
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
      <div
        className="library-detail-tabs"
        role="group"
        aria-label={t('Asset connections')}
      >
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={model.libraryDetailsTab === 'usedBy'}
          onClick={usedBy}
        >
          {t('Used by')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={model.libraryDetailsTab === 'uses'}
          onClick={uses}
        >
          {t('Uses assets')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={model.libraryDetailsTab === 'impact'}
          onClick={impact}
        >
          {t('Impact')}
        </Button>
      </div>
      <LibraryUsageList model={model} />
    </section>
  )
}
