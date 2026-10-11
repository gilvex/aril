import { useCallback, type ChangeEvent, type MouseEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryFilters({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch, libraryTab, libraryQuery, libraryKind, libraryUsage } = model
  const view = useCallback(
    (e: MouseEvent<HTMLButtonElement>) =>
      patch({
        libraryTab: e.currentTarget.dataset.view as typeof libraryTab,
        libraryOffset: 0,
        libraryFocus: false,
      }),
    [patch],
  )
  const search = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      patch({
        libraryQuery: e.target.value,
        libraryOffset: 0,
        libraryFocus: false,
        libraryAsset: null,
      }),
    [patch],
  )
  const filter = useCallback(
    (e: SelectChange) =>
      patch({
        libraryKind: e.target.value as typeof libraryKind,
        libraryOffset: 0,
        libraryFocus: false,
        libraryAsset: null,
      }),
    [patch],
  )
  const usage = useCallback(
    (e: SelectChange) =>
      patch({
        libraryUsage: e.target.value as typeof libraryUsage,
        libraryOffset: 0,
        libraryFocus: false,
        libraryAsset: null,
      }),
    [patch],
  )
  return (
    <div className="library-filters">
      <div role="group" aria-label={t('Library view')}>
        <Button
          className="button"
          size="sm"
          variant="ghost"
          aria-pressed={libraryTab === 'browse'}
          data-view="browse"
          onClick={view}
        >
          {t('Browse')}
        </Button>
        <Button
          className="button"
          size="sm"
          variant="ghost"
          aria-pressed={libraryTab === 'variables'}
          data-view="variables"
          onClick={view}
        >
          {t('Variables')}
        </Button>
        <Button
          className="button"
          size="sm"
          variant="ghost"
          aria-pressed={libraryTab === 'graph'}
          data-view="graph"
          onClick={view}
        >
          {t('Map')}
        </Button>
      </div>
      {libraryTab !== 'variables' && (
        <>
          <input
            value={libraryQuery}
            onChange={search}
            placeholder={t('Search assets')}
            aria-label={t('Search assets')}
          />
          <StudioSelect
            value={libraryKind}
            onChange={filter}
            aria-label={t('Asset type')}
          >
            <option value="all">{t('All assets')}</option>
            <option value="component">{t('Components')}</option>
            <option value="variable">{t('Variables')}</option>
            <option value="page">{t('Pages')}</option>
          </StudioSelect>
          <StudioSelect
            value={libraryUsage}
            onChange={usage}
            aria-label={t('Usage filter')}
          >
            <option value="all">{t('All usages')}</option>
            <option value="used">{t('Used')}</option>
            <option value="unused">{t('Unused')}</option>
          </StudioSelect>
        </>
      )}
    </div>
  )
}
