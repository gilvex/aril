import { useCallback } from 'react'
import { CanvasModeBar, useCanvasTools } from '@/features/canvasTools/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCanvasChromeHandlers } from '../model/useCanvasChromeHandlers.tsx'

import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import type { CanvasChromeProps } from '@/widgets/board/types/canvasChromeProps.ts'
import { Hand, MousePointer2 } from 'lucide-react'
import { ActionBarButton } from 'vagabond-ui/action-bar'

export function CanvasChrome({
  navigation,
  actions,
  children,
  tool,
  onTool,
  multiSelect,
  onMultiSelect,
  preview = false,
  onModeChange,
}: CanvasChromeProps) {
  const { t } = useTranslation()
  const tools = useCanvasTools()

  const compact = useCompactLayout()

  const { handleClick } = useCanvasChromeHandlers({
    onTool,
    compact,
    onMultiSelect,
    multiSelect,
  })
  const select = useCallback(() => {
    tools.patch({ drawing: null, draft: null, pointerId: null })
    handleClick()
  }, [tools, handleClick])
  const pan = useCallback(() => {
    tools.patch({ drawing: null, draft: null, pointerId: null })
    onTool('pan')
  }, [tools, onTool])
  return (
    <>
      {navigation}
      {!compact && <div className="canvas-top-actions">{actions}</div>}
      <CanvasModeBar
        className="canvas-tool-dock"
        label={t('Canvas tools')}
        onModeChange={onModeChange}
        extras={compact && actions}
        navigation={
          <>
            <ActionBarButton
              className="button"
              aria-label={
                compact ? t('Select multiple items') : t('Select tool')
              }
              title={compact ? t('Select multiple items') : t('Select tool')}
              aria-pressed={
                !tools.drawing && (compact ? multiSelect : tool === 'select')
              }
              onClick={select}
              disabled={preview}
            >
              <MousePointer2 size={17} />
            </ActionBarButton>
            <ActionBarButton
              className="button"
              title={t('Pan tool')}
              aria-label={t('Pan tool')}
              aria-pressed={!tools.drawing && tool === 'pan'}
              onClick={pan}
              disabled={preview}
            >
              <Hand size={17} />
            </ActionBarButton>
          </>
        }
      >
        {children}
      </CanvasModeBar>
    </>
  )
}
