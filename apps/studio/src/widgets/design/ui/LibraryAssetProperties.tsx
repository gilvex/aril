import { useMemo } from 'react'
import { designPosition } from '@aril/domain/design'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useLibraryAssetPreview } from '../model/useLibraryAssetPreview.ts'
import { LibraryAssetBindings } from './LibraryAssetBindings.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function LibraryAssetProperties({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { component, variant, nodes } = useLibraryAssetPreview(model)
  const variable = model.libraryAsset?.startsWith('variable:')
    ? model.library.variables[model.libraryAsset.slice(9)]
    : undefined
  const boxes = useMemo(
    () =>
      nodes
        .filter((n) => !n.parentId)
        .map((n) => ({
          ...designPosition(nodes, n),
          width: n.width,
          height: n.height,
        })),
    [nodes],
  )
  const width = boxes.length
    ? Math.max(...boxes.map((b) => b.x + b.width)) -
      Math.min(...boxes.map((b) => b.x))
    : 0
  const height = boxes.length
    ? Math.max(...boxes.map((b) => b.y + b.height)) -
      Math.min(...boxes.map((b) => b.y))
    : 0
  return (
    <section className="asset-properties">
      <h4>{t('Properties')}</h4>
      <dl>
        {variable ? (
          <>
            <div>
              <dt>{t('Type')}</dt>
              <dd>{t(variable.type)}</dd>
            </div>
            <div>
              <dt>{t('Collection')}</dt>
              <dd>{model.library.collections[variable.collectionId]?.name}</dd>
            </div>
          </>
        ) : (
          <>
            <div>
              <dt>{t('Size')}</dt>
              <dd>
                {Math.round(width)} × {Math.round(height)}
              </dd>
            </div>
            <div>
              <dt>{t('Layers')}</dt>
              <dd>{nodes.length}</dd>
            </div>
            {component && (
              <div>
                <dt>{t('Variant')}</dt>
                <dd>{variant?.name}</dd>
              </div>
            )}
          </>
        )}
      </dl>
      {variable && (
        <>
          <h4>{t('Values by mode')}</h4>
          <dl>
            {Object.entries(variable.values).map(([mode, value]) => (
              <div key={mode}>
                <dt>{mode}</dt>
                <dd>
                  {variable.type === 'color' &&
                    /^#[0-9a-f]{6}$/i.test(String(value)) && (
                      <span
                        className="asset-value-swatch"
                        style={{ background: String(value) }}
                      />
                    )}
                  <span>{String(value)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
      <LibraryAssetBindings model={model} />
    </section>
  )
}
