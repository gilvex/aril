import {
  useCallback,
  useMemo,
  type MouseEvent,
  type KeyboardEvent,
} from 'react'
import { DesignLibraryTabs } from './DesignLibraryTabs.tsx'
import { X } from 'lucide-react'
import { SurfaceGrip } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import '../designLayerList.css'
import { DesignLayerActionSheet } from './DesignLayerActionSheet.tsx'
import { DesignLayerRow } from './DesignLayerRow.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { designTreeRows } from '../utils/designTreeRows.ts'
export function DesignLayers({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch } = model
  const close = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.currentTarget
        .closest('.main-area')
        ?.querySelector<HTMLButtonElement>('[data-design-tool="layers"]')
        ?.focus()
      patch({ layers: false, layerActionsId: null })
    },
    [patch],
  )
  const nodes = useMemo(
    () => designTreeRows(model.page.nodes, model.collapsed),
    [model.page.nodes, model.collapsed],
  )
  const scrollKeys = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Home',
        'End',
        'PageUp',
        'PageDown',
      ].includes(event.key)
    )
      event.stopPropagation()
  }, [])
  const actionsOpen = model.compact && !!model.layerActionsId
  return (
    <aside
      className="design-layers"
      data-compact={model.compact || undefined}
      aria-label={t('Layers')}
    >
      <header
        className="design-layers-heading"
        style={actionsOpen ? { display: 'none' } : undefined}
      >
        <SurfaceGrip />
        <DesignLibraryTabs model={model} />
        <small title={`${model.page.nodes.length}/500`}>
          {model.page.nodes.length}
        </small>
        <button
          className="icon-button"
          aria-label={t('Close layers')}
          onClick={close}
        >
          <X size={15} />
        </button>
      </header>
      <div
        className="design-layers-list"
        style={actionsOpen ? { display: 'none' } : undefined}
        tabIndex={0}
        role="region"
        aria-label={t('Layers')}
        onKeyDown={scrollKeys}
      >
        <div className="design-layers-tree">
          {nodes.map(({ node, depth }) => (
            <DesignLayerRow
              key={node.id}
              node={node}
              depth={depth}
              model={model}
            />
          ))}
        </div>
        {!nodes.length && <p>{t('Insert a frame to start designing.')}</p>}
      </div>
      {actionsOpen && <DesignLayerActionSheet model={model} />}
    </aside>
  )
}
