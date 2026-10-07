import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { DesignNavigation } from './DesignNavigation.tsx'
import { DesignPanelActions } from './DesignPanelActions.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useCallback, useRef, type MouseEvent } from 'react'
import { Hand, MousePointer2, Plus, LayoutTemplate } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { designTools } from '../config/designTools.ts'
import type { DesignElement } from '@pomegranate/domain/design'
import type { DesignToolbarProps } from '../types/designToolbarProps.ts'
import { DesignCanvasActions } from './DesignCanvasActions.tsx'
import { ActionBarButton } from 'vagabond-ui/action-bar'
import { StudioActionBar } from '@/shared/ui/index.tsx'

export function DesignToolbar({
  model,
  navigation,
  add,
  insertTemplate,
}: DesignToolbarProps) {
  const { t } = useTranslation()
  const compact = useCompactLayout()
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
      <DesignNavigation model={model} navigation={navigation} />
      {!compact && (
        <DesignPanelActions model={model} boardDesign={!!navigation} />
      )}
      <StudioActionBar className="design-tool-dock" label={t('Design tools')}>
        <ActionBarButton
          className={model.tool === 'select' ? 'active' : ''}
          aria-pressed={model.tool === 'select'}
          title={t('Select')}
          aria-label={t('Select')}
          onClick={() => model.patch({ tool: 'select' })}
        >
          <MousePointer2 size={18} />
        </ActionBarButton>
        <ActionBarButton
          className={model.tool === 'pan' ? 'active' : ''}
          aria-pressed={model.tool === 'pan'}
          title={t('Pan')}
          aria-label={t('Pan')}
          onClick={() => model.patch({ tool: 'pan' })}
        >
          <Hand size={18} />
        </ActionBarButton>
        {!readOnly && (
          <details ref={menu} className="design-insert-menu">
            <ActionBarButton asChild>
              <summary
                role="button"
                aria-label={t('Insert')}
                title={t('Insert')}
              >
                <Plus size={18} />
              </summary>
            </ActionBarButton>
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
      </StudioActionBar>
    </>
  )
}
