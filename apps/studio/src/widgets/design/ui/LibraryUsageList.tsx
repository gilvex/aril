import { useMemo } from 'react'
import { Component, File, Variable } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { Accordion } from 'vagabond-ui/accordion'
import { useDesignUsageDetails } from '../model/useDesignUsageDetails.ts'
import { useLibraryAssetNavigation } from '../model/useLibraryAssetNavigation.ts'
import { libraryUsageResults } from '../utils/libraryUsageResults.ts'
import { LibraryUsageGroup } from './LibraryUsageGroup.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function LibraryUsageList({ model }: DesignEditorProps) {
  const { t, navigate, patch } = useDesignUsageDetails(model)
  const { inspect } = useLibraryAssetNavigation(model)
  const {
    usage,
    library,
    libraryAsset,
    libraryUsageQuery,
    libraryUsageLimit: limit,
    libraryDetailsTab: tab,
  } = model
  const results = useMemo(
    () => libraryUsageResults(usage, library, libraryAsset, libraryUsageQuery),
    [usage, library, libraryAsset, libraryUsageQuery],
  )
  const entries = tab === 'uses' ? results.dependencies : results.indirect
  const count = tab === 'usedBy' ? results.groups.length : entries.length
  return (
    <div className="library-references asset-references">
      {tab === 'usedBy' ? (
        <Accordion
          type="multiple"
          key={`${libraryAsset}:${libraryUsageQuery}`}
          defaultValue={results.groups.slice(0, 1).map(([id]) => id)}
        >
          {results.groups.slice(0, limit).map(([id, entries]) => (
            <LibraryUsageGroup
              key={id}
              entries={entries}
              model={model}
              navigate={navigate}
            />
          ))}
        </Accordion>
      ) : (
        <>
          {tab === 'impact' && (
            <p>
              {t(
                'Reached through other assets. Direct usages are listed separately.',
              )}
            </p>
          )}
          <ul className="asset-connection-list">
            {entries.slice(0, limit).map((entry) => (
              <li key={entry.id}>
                <Button
                  className="button asset-connection"
                  variant="ghost"
                  onClick={() => inspect(entry.id)}
                >
                  {entry.id.startsWith('variable:') ? (
                    <Variable size={16} />
                  ) : entry.id.startsWith('component:') ? (
                    <Component size={16} />
                  ) : (
                    <File size={16} />
                  )}
                  <span>{entry.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
      {!count && (
        <p className="asset-empty">
          {t(
            libraryUsageQuery
              ? 'No connections match your search.'
              : tab === 'usedBy'
                ? 'This asset has no direct usages yet.'
                : tab === 'uses'
                  ? 'This asset does not use other library assets.'
                  : 'No indirect usages found.',
          )}
        </p>
      )}
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
