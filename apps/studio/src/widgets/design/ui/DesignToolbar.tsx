import { DesignInsertMenu } from './DesignInsertMenu.tsx'
import { DesignMobileToolsButton } from './DesignMobileToolsButton.tsx'
import { DesignMobilePagesButton } from './DesignMobilePagesButton.tsx'
import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { DesignNavigation } from './DesignNavigation.tsx'
import { DesignPanelActions } from './DesignPanelActions.tsx'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { Hand, MousePointer2 } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
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
  return (
    <>
      <DesignNavigation model={model} navigation={navigation} />
      {!compact && (
        <DesignPanelActions model={model} boardDesign={!!navigation} />
      )}
      {(model.libraryView === 'canvas' || compact) && (
        <StudioActionBar
          className={`design-tool-dock${compact && (model.layers || model.inspector || model.pagesOpen) ? ' tools-open' : ''}`}
          label={t('Design tools')}
        >
          {model.libraryView === 'canvas' && (
            <>
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
                <DesignInsertMenu
                  model={model}
                  add={add}
                  insertTemplate={insertTemplate}
                />
              )}
            </>
          )}
          {compact ? (
            <>
              <DesignMobilePagesButton model={model} />
              <DesignMobileToolsButton model={model} />
            </>
          ) : (
            !readOnly && <DesignCanvasActions model={model} />
          )}
        </StudioActionBar>
      )}
    </>
  )
}
