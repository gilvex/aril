import { useCallback } from 'react'
import { Button } from 'vagabond-ui/button'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryUsageGroupProps } from '../types/libraryUsageGroupProps.ts'
export function LibraryUsageGroup({
  entries,
  model,
  navigate,
}: LibraryUsageGroupProps) {
  const { t } = useTranslation()
  const { library, libraryUsageLimit: limit, patch } = model
  const more = useCallback(
    () => patch({ libraryUsageLimit: limit + 50 }),
    [patch, limit],
  )
  return (
    <details className="library-usage-group">
      <summary>
        {entries[0].ownerName}
        <small>{entries.length}</small>
      </summary>
      <ul>
        {entries.slice(0, limit).map((use, index) => (
          <li key={index}>
            <button onClick={() => navigate(use)}>
              <strong>{use.nodeName || use.ownerName}</strong>
              <span>
                {[
                  use.variantId &&
                    library.components[use.ownerId]?.variants[use.variantId]
                      ?.name,
                  use.stateId,
                  use.transitionId,
                  use.property,
                ]
                  .filter(Boolean)
                  .join(' / ')}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {entries.length > limit && (
        <Button className="button" size="sm" variant="ghost" onClick={more}>
          {t('Show more')}
        </Button>
      )}
    </details>
  )
}
