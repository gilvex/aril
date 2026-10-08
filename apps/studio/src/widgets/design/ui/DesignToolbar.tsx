import { useCallback, useEffect } from 'react'
import { Hand, MousePointer2, Braces } from 'lucide-react'
import { StudioActionButton } from '@/shared/ui/index.tsx'
import {
  CanvasModeBar,
  CanvasDrawTools,
  CanvasInspectTools,
  useCanvasTools,
  type CanvasToolMode,
} from '@/features/canvasTools/index.ts'
import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignNavigation } from './DesignNavigation.tsx'
import { DesignPanelActions } from './DesignPanelActions.tsx'
import { DesignMobileToolsButton } from './DesignMobileToolsButton.tsx'
import { DesignMobilePagesButton } from './DesignMobilePagesButton.tsx'
import { DesignShapeTools } from './DesignShapeTools.tsx'
import { DesignMotionTools } from './DesignMotionTools.tsx'
import type { DesignToolbarProps } from '../types/designToolbarProps.ts'
export function DesignToolbar(props: DesignToolbarProps) {
  const { model, navigation } = props
  const { t } = useTranslation()
  const compact = useCompactLayout()
  const tools = useCanvasTools()
  const { setMode } = tools
  useEffect(() => {
    if (model.libraryView === 'machine') setMode('motion')
    if (model.libraryView === 'variables') setMode('dev')
  }, [model.libraryView, setMode])
  const select = useCallback(() => {
    tools.patch({ drawing: null, draft: null, pointerId: null })
    model.patch({ tool: 'select' })
  }, [model, tools])
  const pan = useCallback(() => {
    tools.patch({ drawing: null, draft: null, pointerId: null })
    model.patch({ tool: 'pan' })
  }, [model, tools])
  const changeMode = useCallback(
    (mode: CanvasToolMode) => {
      if (
        mode === 'draw' ||
        mode === 'shapes' ||
        (mode === 'dev' && model.libraryView === 'machine')
      )
        model.patch({
          libraryView: 'canvas',
          machineId: null,
          simulation: null,
        })
    },
    [model],
  )
  const inspect = useCallback(
    () =>
      model.patch({
        inspector: true,
        styles: false,
        ...(compact
          ? { layers: false, pagesOpen: false, mobileToolsTab: 'properties' }
          : {}),
      }),
    [model, compact],
  )
  const variables = useCallback(() => model.openAsset('variables'), [model])
  return (
    <>
      <DesignNavigation model={model} navigation={navigation} />
      {!compact && (
        <DesignPanelActions model={model} boardDesign={!!navigation} />
      )}
      <CanvasModeBar
        className={`design-tool-dock${compact && (model.layers || model.inspector || model.pagesOpen) ? ' tools-open' : ''}`}
        label={t('Design tools')}
        onModeChange={changeMode}
        navigation={
          <>
            <StudioActionButton
              aria-pressed={!tools.drawing && model.tool === 'select'}
              title={t('Select')}
              aria-label={t('Select')}
              onClick={select}
            >
              <MousePointer2 size={18} />
            </StudioActionButton>
            <StudioActionButton
              aria-pressed={!tools.drawing && model.tool === 'pan'}
              title={t('Pan')}
              aria-label={t('Pan')}
              onClick={pan}
            >
              <Hand size={18} />
            </StudioActionButton>
          </>
        }
        extras={
          compact && (
            <>
              <DesignMobilePagesButton model={model} />
              <DesignMobileToolsButton model={model} />
            </>
          )
        }
      >
        {tools.mode === 'draw' && (
          <CanvasDrawTools
            disabled={!!model.component || model.libraryView !== 'canvas'}
          />
        )}
        {tools.mode === 'shapes' && <DesignShapeTools {...props} />}
        {tools.mode === 'dev' && (
          <>
            <CanvasInspectTools
              data={model.selected.length ? model.selected : model.page}
              inspect={inspect}
            />
            <StudioActionButton
              onClick={variables}
              title={t('Variables')}
              aria-label={t('Variables')}
            >
              <Braces size={18} />
            </StudioActionButton>
          </>
        )}
        {tools.mode === 'motion' && <DesignMotionTools model={model} />}
      </CanvasModeBar>
    </>
  )
}
