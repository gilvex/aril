import { useMemo } from 'react'
import { Button } from 'vagabond-ui/button'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useLibraryAssetPreview } from '../model/useLibraryAssetPreview.ts'
import { useLibraryAssetNavigation } from '../model/useLibraryAssetNavigation.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function LibraryAssetBindings({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { nodes } = useLibraryAssetPreview(model)
  const { inspect } = useLibraryAssetNavigation(model)
  const bindings = useMemo(
    () =>
      nodes.flatMap((node) =>
        Object.entries(node.bindings || {}).map(([property, id]) => ({
          key: `${node.id}:${property}`,
          name: node.name,
          property,
          id,
        })),
      ),
    [nodes],
  )
  if (!bindings.length) return null
  return (
    <>
      <h4>{t('Bound variables')}</h4>
      <ul className="asset-bindings">
        {bindings.slice(0, model.libraryUsageLimit).map((binding) => (
          <li key={binding.key}>
            <Button
              className="button asset-binding"
              variant="ghost"
              size="sm"
              onClick={() => inspect(`variable:${binding.id}`)}
            >
              <span>
                <strong>
                  {model.library.variables[binding.id]?.name || binding.id}
                </strong>
                <small>
                  {binding.name} · {binding.property}
                </small>
              </span>
            </Button>
          </li>
        ))}
      </ul>
      {bindings.length > model.libraryUsageLimit && (
        <Button
          className="button"
          size="sm"
          variant="ghost"
          onClick={() =>
            model.patch({ libraryUsageLimit: model.libraryUsageLimit + 50 })
          }
        >
          {t('Show more')}
        </Button>
      )}
    </>
  )
}
