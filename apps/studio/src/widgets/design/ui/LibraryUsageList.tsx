import { useCallback, useMemo, type MouseEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { useDesignUsageDetails } from '../model/useDesignUsageDetails.ts'
import { LibraryUsageGroup } from './LibraryUsageGroup.tsx'
import { libraryIndirectUsage } from '../utils/libraryIndirectUsage.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function LibraryUsageList({ model }: DesignEditorProps) {
  const { t, uses, dependencies, navigate, library, patch } =
    useDesignUsageDetails(model)
  const groups = useMemo(() => {
    const result = new Map<string, typeof uses>()
    for (const use of uses) {
      const key = `${use.ownerKind}:${use.ownerId}`
      const list = result.get(key) || []
      list.push(use)
      result.set(key, list)
    }
    return [...result.entries()]
  }, [uses])
  const unique = useMemo(
    () => [
      ...new Map(
        dependencies.map((u) => [`${u.assetKind}:${u.assetId}`, u]),
      ).entries(),
    ],
    [dependencies],
  )
  const indirect = useMemo(
    () => libraryIndirectUsage(model.usage, model.libraryAsset),
    [model.usage, model.libraryAsset],
  )
  const select = useCallback(
    (event: MouseEvent<HTMLButtonElement>) =>
      patch({
        libraryAsset: event.currentTarget.dataset.id!,
        libraryUsageLimit: 50,
        libraryFocus: true,
        libraryOffset: 0,
      }),
    [patch],
  )
  const limit = model.libraryUsageLimit
  const tab = model.libraryDetailsTab
  const count =
    tab === 'usedBy'
      ? groups.length
      : tab === 'uses'
        ? unique.length
        : indirect.length
  return (
    <div className="library-references">
      {tab === 'usedBy' && (
        <>
          <p>
            {t('{{count}} uses', { count: uses.length })} ·{' '}
            {t('{{count}} locations', { count: groups.length })}
          </p>
          {groups.slice(0, limit).map(([id, entries]) => (
            <LibraryUsageGroup
              key={id}
              entries={entries}
              model={model}
              navigate={navigate}
            />
          ))}
        </>
      )}
      {tab === 'uses' && (
        <ul>
          {unique.slice(0, limit).map(([id, use]) => (
            <li key={id}>
              <button data-id={id} onClick={select}>
                {use.assetKind === 'component'
                  ? library.components[use.assetId]?.name || use.assetId
                  : library.variables[use.assetId]?.name || use.assetId}
              </button>
            </li>
          ))}
        </ul>
      )}
      {tab === 'impact' && (
        <>
          <p>
            {t(
              'Reached through other assets. Direct usages are listed separately.',
            )}
          </p>
          <ul>
            {indirect.slice(0, limit).map((a) => (
              <li key={a.id}>
                <button data-id={a.id} onClick={select}>
                  {a.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      {!count && <p>{t('No matching connections')}</p>}
      {count > limit && (
        <Button
          className="button"
          size="sm"
          variant="ghost"
          onClick={() => patch({ libraryUsageLimit: limit + 50 })}
        >
          {t('Show more')}
        </Button>
      )}
    </div>
  )
}
