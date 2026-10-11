import { useCallback, type ChangeEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryFilters({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch, libraryTab, libraryQuery, libraryKind } = model
  const graph = useCallback(() => patch({ libraryTab: 'graph' }), [patch])
  const variables = useCallback(
    () => patch({ libraryTab: 'variables' }),
    [patch],
  )
  const search = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      patch({ libraryQuery: e.target.value }),
    [patch],
  )
  const filter = useCallback(
    (e: SelectChange) =>
      patch({ libraryKind: e.target.value as typeof libraryKind }),
    [patch],
  )
  return (
    <div className="library-filters">
      <div role="group" aria-label={t('Library view')}>
        <Button
          className="button"
          size="sm"
          variant="ghost"
          aria-pressed={libraryTab === 'graph'}
          onClick={graph}
        >
          {t('Usage graph')}
        </Button>
        <Button
          className="button"
          size="sm"
          variant="ghost"
          aria-pressed={libraryTab === 'variables'}
          onClick={variables}
        >
          {t('Variables')}
        </Button>
      </div>
      {libraryTab === 'graph' && (
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
            <option value="machine">{t('State machines')}</option>
            <option value="page">{t('Pages')}</option>
          </StudioSelect>
        </>
      )}
    </div>
  )
}
