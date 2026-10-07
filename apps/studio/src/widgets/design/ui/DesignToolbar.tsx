import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useCallback, useRef, type MouseEvent } from 'react'
import {
  Hand,
  MousePointer2,
  Plus,
  PanelLeft,
  PanelRight,
  Palette,
  LayoutTemplate,
} from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { designTools } from '../config/designTools.ts'
import type { DesignElement } from '@pomegranate/domain/design'
import type { DesignToolbarProps } from '../types/designToolbarProps.ts'
import { DesignCanvasActions } from './DesignCanvasActions.tsx'

export function DesignToolbar({
  model,
  add,
  insertTemplate,
}: DesignToolbarProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'
  const menu = useRef<HTMLDetailsElement>(null)
  const insert = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      add(
        event.currentTarget.dataset.kind as DesignElement['kind'],
        event.currentTarget.dataset.mobile === 'true',
      )
      if (menu.current) menu.current.open = false
    },
    [add],
  )
  const template = useCallback(() => {
    insertTemplate()
    if (menu.current) menu.current.open = false
  }, [insertTemplate])
  return (
    <>
      <div className="design-canvas-navigation">
        <button
          className="icon-button"
          title={t('Pages and layers')}
          aria-label={t('Pages and layers')}
          aria-expanded={model.layers}
          onClick={() =>
            model.patch({ layers: !model.layers, inspector: false })
          }
        >
          <PanelLeft size={18} />
        </button>
        <span>{t('Design')}</span>
        <span className="design-nav-divider">/</span>
        <strong>{model.page.name}</strong>
      </div>
      <div className="design-canvas-actions">
        <button
          className="button"
          aria-label={t('Styles')}
          aria-expanded={model.inspector && model.styles}
          onClick={() => model.patch({ inspector: true, styles: true })}
        >
          <Palette size={16} />
          <span>{t('Styles')}</span>
        </button>
        <button
          className="button"
          aria-label={t('Properties')}
          aria-expanded={model.inspector && !model.styles}
          onClick={() =>
            model.patch({
              inspector: !model.inspector || model.styles,
              styles: false,
            })
          }
        >
          <PanelRight size={16} />
          <span>{t('Properties')}</span>
        </button>
      </div>
      <div
        className="design-tool-dock"
        role="toolbar"
        aria-label={t('Design tools')}
      >
        <button
          className={model.tool === 'select' ? 'active' : ''}
          aria-pressed={model.tool === 'select'}
          title={t('Select')}
          aria-label={t('Select')}
          onClick={() => model.patch({ tool: 'select' })}
        >
          <MousePointer2 size={18} />
        </button>
        <button
          className={model.tool === 'pan' ? 'active' : ''}
          aria-pressed={model.tool === 'pan'}
          title={t('Pan')}
          aria-label={t('Pan')}
          onClick={() => model.patch({ tool: 'pan' })}
        >
          <Hand size={18} />
        </button>
        {!readOnly && (
          <details ref={menu} className="design-insert-menu">
            <summary aria-label={t('Insert')} title={t('Insert')}>
              <Plus size={18} />
            </summary>
            <div role="group" aria-label={t('Insert element')}>
              {designTools.map(({ kind, label, icon: Icon, ...rest }) => (
                <button
                  key={label}
                  data-kind={kind}
                  data-mobile={
                    'mobile' in rest && rest.mobile ? 'true' : 'false'
                  }
                  onClick={insert}
                  disabled={model.page.nodes.length >= 500}
                >
                  <Icon size={16} />
                  {t(label)}
                </button>
              ))}
              <hr />
              <button
                onClick={template}
                disabled={model.page.nodes.length > 440}
              >
                <LayoutTemplate size={16} />
                {t('Server dashboard template')}
              </button>
            </div>
          </details>
        )}
        {!readOnly && <DesignCanvasActions model={model} />}
      </div>
    </>
  )
}
