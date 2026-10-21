import { Text } from '@/shared/ui/Text.tsx'
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
      <Text as="h4">{t('Properties')}</Text>
      <dl>
        {variable ? (
          <>
            <div>
              <Text as="dt">{t('Type')}</Text>
              <Text as="dd">{t(variable.type)}</Text>
            </div>
            <div>
              <Text as="dt">{t('Collection')}</Text>
              <Text as="dd">
                {model.library.collections[variable.collectionId]?.name}
              </Text>
            </div>
          </>
        ) : (
          <>
            <div>
              <Text as="dt">{t('Size')}</Text>
              <Text as="dd">
                {Math.round(width)} × {Math.round(height)}
              </Text>
            </div>
            <div>
              <Text as="dt">{t('Layers')}</Text>
              <Text as="dd">{nodes.length}</Text>
            </div>
            {component && (
              <div>
                <Text as="dt">{t('Variant')}</Text>
                <Text as="dd">{variant?.name}</Text>
              </div>
            )}
          </>
        )}
      </dl>
      {variable && (
        <>
          <Text as="h4">{t('Values by mode')}</Text>
          <dl>
            {Object.entries(variable.values).map(([mode, value]) => (
              <div key={mode}>
                <Text as="dt">{mode}</Text>
                <Text as="dd">
                  {variable.type === 'color' &&
                    /^#[0-9a-f]{6}$/i.test(String(value)) && (
                      <span
                        className="asset-value-swatch"
                        style={{ background: String(value) }}
                      />
                    )}
                  <Text as="span">{String(value)}</Text>
                </Text>
              </div>
            ))}
          </dl>
        </>
      )}
      <LibraryAssetBindings model={model} />
    </section>
  )
}
