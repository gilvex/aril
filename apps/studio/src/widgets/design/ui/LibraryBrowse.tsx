import { useCallback, type MouseEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { Component, Variable, Workflow, File } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { LibraryExplorerProps } from '../types/libraryExplorerProps.ts'
const icons = {
  component: Component,
  variable: Variable,
  machine: Workflow,
  page: File,
}
export function LibraryBrowse({ model, explorer }: LibraryExplorerProps) {
  const { t } = useTranslation()
  const { patch, librarySelection } = model
  const select = useCallback(
    (e: MouseEvent<HTMLButtonElement>) =>
      patch({
        libraryAsset: e.currentTarget.dataset.id!,
        libraryDetailsOpen: true,
        libraryUsageLimit: 50,
      }),
    [patch],
  )
  const toggle = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const id = e.currentTarget.dataset.id!
      patch({
        librarySelection: librarySelection.includes(id)
          ? librarySelection.filter((a) => a !== id)
          : [...librarySelection, id],
      })
    },
    [patch, librarySelection],
  )
  const clear = useCallback(() => patch({ librarySelection: [] }), [patch])
  const organize = useCallback(
    () => patch({ libraryDetailsOpen: true }),
    [patch],
  )
  const { graph } = explorer
  return (
    <div className="library-browse">
      {!!librarySelection.length && (
        <div className="library-browse-selection">
          <strong>
            {t('{{count}} selected', { count: librarySelection.length })}
          </strong>
          <Button
            className="button"
            size="sm"
            variant="outline"
            onClick={organize}
          >
            {t('Organization')}
          </Button>
          <Button className="button" size="sm" variant="ghost" onClick={clear}>
            {t('Clear selection')}
          </Button>
        </div>
      )}
      <div className="library-asset-grid">
        {graph.assets
          .slice(graph.offset, graph.offset + graph.pageSize)
          .map((asset) => {
            const Icon = icons[asset.kind]
            const variable = model.library.variables[asset.assetId]
            const value = variable && Object.values(variable.values)[0]
            return (
              <article
                key={asset.id}
                className="library-asset-card"
                data-selected={model.libraryAsset === asset.id || undefined}
              >
                {asset.kind !== 'page' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="button library-asset-check"
                    role="checkbox"
                    aria-checked={librarySelection.includes(asset.id)}
                    aria-label={t('Select {{name}}', { name: asset.name })}
                    data-id={asset.id}
                    onClick={toggle}
                  >
                    {librarySelection.includes(asset.id) ? '✓' : '+'}
                  </Button>
                )}
                <button
                  className="library-asset-pick"
                  data-id={asset.id}
                  onClick={select}
                >
                  <span
                    className="library-asset-art"
                    style={
                      variable?.type === 'color' && typeof value === 'string'
                        ? { background: value }
                        : undefined
                    }
                  >
                    {asset.icon || <Icon size={28} />}
                  </span>
                  <strong>{asset.name}</strong>
                  <small>
                    {asset.library} / {asset.family}
                  </small>
                  <span>{t('{{count}} uses', { count: asset.count })}</span>
                </button>
              </article>
            )
          })}
      </div>
      {!graph.assets.length && <p>{t('No matching assets')}</p>}
    </div>
  )
}
