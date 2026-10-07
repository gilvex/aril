import { useMemo } from 'react'
import { Plus, X, File, Trash2 } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignLayerRow } from './DesignLayerRow.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLayers({ model }: DesignEditorProps) {
  const { t } = useTranslation()
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
      <header>
        <strong>{t('Pages')}</strong>
        <button
          className="icon-button"
          aria-label={t('Add page')}
          disabled={model.pages.length >= 30}
          onClick={model.addPage}
        >
          <Plus size={16} />
        </button>
        <button
          className="icon-button"
          aria-label={t('Close layers')}
          onClick={() => model.patch({ layers: false })}
        >
          <X size={16} />
        </button>
      </header>
      <div className="design-pages-list">
        {model.pages.map((page) => (
          <button
            key={page.id}
            className={page.id === model.page.id ? 'active' : ''}
            onClick={() => model.selectPage(page.id)}
            aria-current={page.id === model.page.id ? 'page' : undefined}
          >
            <File size={15} />
            <span>{page.name}</span>
            <small>
              {page.nodes.filter((node) => node.kind === 'frame').length}
            </small>
          </button>
        ))}
      </div>
      <div className="design-page-name">
        <input
          aria-label={t('Page name')}
          value={model.page.name}
          maxLength={120}
          onChange={(event) => model.renamePage(event.target.value)}
        />
        <button
          className="icon-button"
          aria-label={t('Delete page')}
          title={t('Delete page')}
          disabled={model.pages.length < 2}
          onClick={model.deletePage}
        >
          <Trash2 size={14} />
        </button>
      </div>
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
