import { Text } from '@/shared/ui/Text.tsx'
import { useCallback, type MouseEvent } from 'react'
import { ComponentGlyph } from './ComponentGlyph.tsx'
import { componentGlyph } from '../utils/componentGlyph.ts'
import { Plus, Component, Variable } from 'lucide-react'
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
        <Text as="h3">
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
        </Text>
        {Object.values(model.library.components)
          .filter((a) => a.name.toLowerCase().includes(query))
          .map((asset) => (
            <div
              className="design-asset-row"
              key={asset.id}
              data-active={asset.id === model.componentId || undefined}
            >
              <button data-id={asset.id} data-kind="component" onClick={pick}>
                <ComponentGlyph
                  icon={asset.icon}
                  glyph={componentGlyph(asset)}
                />
                <Text as="span">{asset.name}</Text>
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
          <Text as="p">
            {t('Select layers, then create a reusable component.')}
          </Text>
        )}
      </section>
      <section>
        <Text as="h3">
          <Variable size={15} />
          {t('Variables')}
        </Text>
        <button className="design-asset-link" onClick={variables}>
          <Text>{t('Collections and modes')}</Text>
          <Text as="small">{Object.keys(model.library.variables).length}</Text>
        </button>
      </section>
    </>
  )
}
