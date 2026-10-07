import { useCallback, type FocusEvent } from 'react'
import { Copy, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignGeometry } from './DesignGeometry.tsx'
import { DesignPaint } from './DesignPaint.tsx'
import { DesignTypography } from './DesignTypography.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignInspector({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const node = model.selected[0]
  const setImage = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      if (event.target.reportValidity())
        model.edit({ imageUrl: event.target.value.trim() })
    },
    [model],
  )
  const front = useCallback(() => {
    const ordered = [...model.page.nodes].sort((a, b) => a.order - b.order)
    const next = [
      ...ordered.filter((item) => !model.selection.includes(item.id)),
      ...ordered.filter((item) => model.selection.includes(item.id)),
    ]
    model.save(next.map((item, order) => ({ ...item, order })))
  }, [model])
  const back = useCallback(() => {
    const ordered = [...model.page.nodes].sort((a, b) => a.order - b.order)
    const next = [
      ...ordered.filter((item) => model.selection.includes(item.id)),
      ...ordered.filter((item) => !model.selection.includes(item.id)),
    ]
    model.save(next.map((item, order) => ({ ...item, order })))
  }, [model])
  return (
    <aside className="design-inspector" aria-label={t('Design properties')}>
      <header>
        <strong>{t('Properties')}</strong>
        <button
          className="icon-button"
          aria-label={t('Close properties')}
          onClick={() => model.patch({ inspector: false })}
        >
          <X size={16} />
        </button>
      </header>
      {node ? (
        <div className="design-inspector-body">
          {model.selected.length > 1 ? (
            <p>
              {t('{{count}} layers selected', { count: model.selected.length })}
            </p>
          ) : (
            <label>
              {t('Layer name')}
              <input
                aria-label={t('Layer name')}
                value={node.name}
                maxLength={120}
                onChange={(event) =>
                  event.target.value.trim() &&
                  model.edit({ name: event.target.value })
                }
              />
            </label>
          )}
          {model.selected.length > 1 && (
            <p className="design-property-hint">
              {t(
                'Values show the first layer. Changes apply to all selected layers.',
              )}
            </p>
          )}
          <DesignGeometry model={model} />
          <DesignPaint model={model} />
          {node.kind !== 'frame' && node.kind !== 'image' && (
            <DesignTypography model={model} />
          )}
          {node.kind === 'image' && (
            <label>
              {t('Image URL')}
              <input
                key={`${node.id}-${node.imageUrl}`}
                aria-label={t('Image URL')}
                type="url"
                pattern="https://.*"
                placeholder="https://…"
                defaultValue={node.imageUrl}
                onBlur={setImage}
                maxLength={2000}
              />
            </label>
          )}
          <section>
            <h3>{t('Arrange')}</h3>
            <div className="design-property-actions">
              <button className="button" onClick={front}>
                <ArrowUp size={14} />
                {t('Bring to front')}
              </button>
              <button className="button" onClick={back}>
                <ArrowDown size={14} />
                {t('Send to back')}
              </button>
            </div>
          </section>
          <div className="design-property-actions">
            <button
              className="button"
              onClick={model.duplicate}
              disabled={model.page.nodes.length + model.selected.length > 500}
            >
              <Copy size={14} />
              {t('Duplicate')}
            </button>
            <button className="button danger" onClick={model.remove}>
              <Trash2 size={14} />
              {t('Delete')}
            </button>
          </div>
        </div>
      ) : (
        <p className="design-inspector-empty">
          {t('Select a layer to edit its layout and appearance.')}
        </p>
      )}
    </aside>
  )
}
