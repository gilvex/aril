import { useCallback, type MouseEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { Layers, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
import { libraryMapColor } from '../utils/libraryMapColor.ts'
export function LibraryCatalog({ model, explorer }: LibraryExplorerProps) {
  const { t } = useTranslation()
  const { patch, libraryPath } = model
  const pick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const path = JSON.parse(
        event.currentTarget.dataset.path || '[]',
      ) as string[]
      patch({
        libraryPath: path,
        libraryOffset: 0,
        libraryAsset: null,
        libraryFocus: false,
      })
    },
    [patch],
  )
  return (
    <nav className="library-catalog" aria-label={t('Libraries')}>
      <Button
        className="button"
        variant="ghost"
        data-path="[]"
        onClick={pick}
        aria-pressed={!libraryPath.length}
      >
        <Layers size={16} />
        <span>{t('All libraries')}</span>
        <small>{explorer.assets.length}</small>
      </Button>
      {explorer.groups.map((group) => (
        <div key={group.name}>
          <Button
            className="button"
            variant="ghost"
            data-path={JSON.stringify([group.name])}
            onClick={pick}
            aria-pressed={libraryPath[0] === group.name && !libraryPath[1]}
          >
            <span
              className="library-color-dot"
              style={{ background: libraryMapColor(group.name) }}
            />
            <span>{group.name}</span>
            <small>{group.count}</small>
          </Button>
          {libraryPath[0] === group.name &&
            [...group.families].map(([name, count]) => (
              <Button
                className="button library-family"
                key={name}
                variant="ghost"
                data-path={JSON.stringify([group.name, name])}
                onClick={pick}
                aria-pressed={libraryPath[1] === name}
              >
                <ChevronRight size={12} />
                <span>{name}</span>
                <small>{count}</small>
              </Button>
            ))}
        </div>
      ))}
      <p>
        {t('Organize assets into libraries and families from their details.')}
      </p>
    </nav>
  )
}
