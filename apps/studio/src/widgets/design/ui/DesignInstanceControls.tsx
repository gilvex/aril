import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/selectChange.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignInstanceControls({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  const link = node?.instance
  const asset = link ? model.library.components[link.componentId] : undefined
  const { save, page, openAsset } = model
  const variant = useCallback(
    (e: SelectChange) =>
      save(
        page.nodes.map((n) =>
          n.instance?.instanceId === link?.instanceId && n.instance
            ? { ...n, instance: { ...n.instance, variantId: e.target.value } }
            : n,
        ),
      ),
    [save, page.nodes, link?.instanceId],
  )
  const detach = useCallback(
    () =>
      save(
        page.nodes.map((n) =>
          n.instance?.instanceId === link?.instanceId
            ? { ...n, instance: undefined }
            : n,
        ),
      ),
    [save, page.nodes, link?.instanceId],
  )
  const reset = useCallback(
    () =>
      save(
        page.nodes.map((n) =>
          n.instance?.instanceId === link?.instanceId && n.instance
            ? {
                ...n,
                instance: {
                  ...n.instance,
                  overrides:
                    n.parentId &&
                    page.nodes.some(
                      (p) =>
                        p.id === n.parentId &&
                        p.instance?.instanceId === link?.instanceId,
                    )
                      ? []
                      : ['x', 'y', 'order', 'parentId'],
                },
              }
            : n,
        ),
      ),
    [save, page.nodes, link?.instanceId],
  )
  const master = useCallback(() => {
    if (asset) openAsset('component', asset.id)
  }, [asset, openAsset])
  if (!asset || !link) return null
  return (
    <section className="design-instance-controls">
      <Text as="h3">{t('Component instance')}</Text>
      <button className="design-asset-link" onClick={master}>
        <Text>{asset.name}</Text>
      </button>
      <StudioSelect
        aria-label={t('Variant')}
        value={link.variantId}
        onChange={variant}
      >
        {Object.values(asset.variants).map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </StudioSelect>
      <div className="design-library-buttons">
        <button onClick={reset}>
          <Text>{t('Reset overrides')}</Text>
        </button>
        <button onClick={detach}>
          <Text>{t('Detach instance')}</Text>
        </button>
      </div>
    </section>
  )
}
