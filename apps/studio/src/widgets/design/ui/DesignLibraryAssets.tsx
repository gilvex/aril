import { useCallback, type MouseEvent } from 'react'
import { Plus, Component, Variable, Workflow } from 'lucide-react'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLibraryAssets({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const { openAsset, insertComponent } = model
  const pick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) =>
      openAsset(
        e.currentTarget.dataset.kind as 'component' | 'machine',
        e.currentTarget.dataset.id,
      ),
    [openAsset],
  )
  const insert = useCallback(
    (e: MouseEvent<HTMLButtonElement>) =>
      insertComponent(e.currentTarget.dataset.id!),
    [insertComponent],
  )
  const variables = useCallback(() => openAsset('variables'), [openAsset])
  const query = model.libraryQuery.toLowerCase()
  return (
    <>
      <section>
        <h3>
          <Component size={15} />
          {t('Components')}
          <button
            className="icon-button"
            title={t('Create component from selection')}
            aria-label={t('Create component from selection')}
            disabled={readOnly || !model.selected.length}
            onClick={model.createComponent}
          >
            <Plus size={15} />
          </button>
        </h3>
        {Object.values(model.library.components)
          .filter((a) => a.name.toLowerCase().includes(query))
          .map((asset) => (
            <div
              className="design-asset-row"
              key={asset.id}
              data-active={asset.id === model.componentId || undefined}
            >
              <button data-id={asset.id} data-kind="component" onClick={pick}>
                <Component size={15} />
                <span>{asset.name}</span>
              </button>
              <button
                className="icon-button"
                title={t('Insert instance')}
                aria-label={t('Insert instance')}
                disabled={readOnly}
                data-id={asset.id}
                onClick={insert}
              >
                <Plus size={15} />
              </button>
            </div>
          ))}
        {!Object.keys(model.library.components).length && (
          <p>{t('Select layers, then create a reusable component.')}</p>
        )}
      </section>
      <section>
        <h3>
          <Variable size={15} />
          {t('Variables')}
        </h3>
        <button className="design-asset-link" onClick={variables}>
          {t('Collections and modes')}
          <small>{Object.keys(model.library.variables).length}</small>
        </button>
      </section>
      <section>
        <h3>
          <Workflow size={15} />
          {t('State machines')}
          <button
            className="icon-button"
            aria-label={t('Add state machine')}
            disabled={
              readOnly || Object.keys(model.library.machines).length >= 100
            }
            onClick={model.addMachine}
          >
            <Plus size={15} />
          </button>
        </h3>
        {Object.values(model.library.machines)
          .filter((a) => a.name.toLowerCase().includes(query))
          .map((asset) => (
            <button
              className="design-asset-link"
              key={asset.id}
              data-id={asset.id}
              data-kind="machine"
              onClick={pick}
            >
              <Workflow size={15} />
              <span>{asset.name}</span>
            </button>
          ))}
      </section>
    </>
  )
}
