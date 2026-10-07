import { useMemo } from 'react'
import { Plus, X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignLayerRow } from './DesignLayerRow.tsx'
import { DesignPageRow } from './DesignPageRow.tsx'
import { useDesignPagesResize } from '../model/useDesignPagesResize.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLayers({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const resize = useDesignPagesResize(model)
  const nodes = useMemo(() => {
    const sorted = [...model.page.nodes].sort((a, b) => b.order - a.order)
    return sorted
      .filter((node) => !node.parentId)
      .flatMap((node) => [
        node,
        ...(model.collapsed.includes(node.id)
          ? []
          : sorted.filter((child) => child.parentId === node.id)),
      ])
  }, [model.page.nodes, model.collapsed])
  return (
    <aside className="design-layers" aria-label={t('Pages and layers')}>
      <div
        className="design-pages-section"
        style={{ height: model.pagesHeight }}
      >
        <header>
          <strong>{t('Pages')}</strong>
          <button
            className="icon-button"
            aria-label={t('Add page')}
            disabled={model.pages.length >= 30}
            onClick={model.addPage}
          >
            <Plus size={15} />
          </button>
          <button
            className="icon-button"
            aria-label={t('Close layers')}
            onClick={() => model.patch({ layers: false })}
          >
            <X size={15} />
          </button>
        </header>
        <div className="design-pages-list">
          {model.pages.map((page) => (
            <DesignPageRow key={page.id} page={page} model={model} />
          ))}
        </div>
      </div>
      <div
        className="design-pages-splitter"
        role="separator"
        tabIndex={0}
        aria-label={t('Resize pages and layers')}
        aria-orientation="horizontal"
        aria-valuemin={72}
        aria-valuemax={800}
        aria-valuenow={model.pagesHeight}
        onPointerDown={resize.start}
        onPointerMove={resize.move}
        onPointerUp={resize.end}
        onPointerCancel={resize.end}
        onLostPointerCapture={resize.end}
        onKeyDown={resize.key}
      />
      <header className="design-layers-heading">
        <strong>{t('Layers')}</strong>
        <small>{model.page.nodes.length}/500</small>
      </header>
      <div className="design-layers-list">
        {nodes.map((node) => (
          <DesignLayerRow key={node.id} node={node} model={model} />
        ))}
        {!nodes.length && <p>{t('Insert a frame to start designing.')}</p>}
      </div>
    </aside>
  )
}
