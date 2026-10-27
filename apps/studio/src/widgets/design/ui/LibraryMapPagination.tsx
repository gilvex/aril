import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { Button } from 'vagabond-ui/button'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
export function LibraryMapPagination({
  model,
  explorer,
}: LibraryExplorerProps) {
  const { t } = useTranslation()
  const { patch, libraryFocus, libraryAsset } = model
  const { total, offset, externalOverflow, pageSize } = explorer.graph
  const previous = useCallback(
    () =>
      patch({
        libraryOffset: Math.max(0, offset - pageSize),
        libraryAsset: libraryFocus ? libraryAsset : null,
      }),
    [patch, offset, pageSize, libraryFocus, libraryAsset],
  )
  const next = useCallback(
    () =>
      patch({
        libraryOffset: offset + pageSize,
        libraryAsset: libraryFocus ? libraryAsset : null,
      }),
    [patch, offset, pageSize, libraryFocus, libraryAsset],
  )
  return (
    <footer className="library-map-pagination">
      <Text as="span">
        {t('Showing {{start}}–{{end}} of {{total}} items', {
          start: total ? offset + 1 : 0,
          end: Math.min(total, offset + pageSize),
          total,
        })}
      </Text>
      {externalOverflow > 0 && (
        <Text as="small">
          {t('{{count}} other connected libraries are available in Browse.', {
            count: externalOverflow,
          })}
        </Text>
      )}
      {total > pageSize && (
        <>
          <Button
            className="button"
            size="sm"
            variant="ghost"
            disabled={!offset}
            onClick={previous}
          >
            <Text>{t('Previous')}</Text>
          </Button>
          <Button
            className="button"
            size="sm"
            variant="ghost"
            disabled={offset + pageSize >= total}
            onClick={next}
          >
            <Text>{t('Next')}</Text>
          </Button>
        </>
      )}
    </footer>
  )
}
