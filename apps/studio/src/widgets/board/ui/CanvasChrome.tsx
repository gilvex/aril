import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCanvasChromeHandlers } from '../model/useCanvasChromeHandlers.tsx'

import { useCompactLayout } from '@/shared/model/useCompactLayout.ts'
import type { CanvasChromeProps } from '@/widgets/board/types/canvasChromeProps.ts'
import { Hand, Link2, MousePointer2 } from 'lucide-react'

export function CanvasChrome({
  navigation,
  actions,
  children,
  tool,
  onTool,
  multiSelect,
  onMultiSelect,
  preview = false,
}: CanvasChromeProps) {
  const { t } = useTranslation()
  const readOnly = useWorkspaceRole() === 'viewer'

  const compact = useCompactLayout()

  const { handleClick } = useCanvasChromeHandlers({
    onTool,
    compact,
    onMultiSelect,
    multiSelect,
  })
  return (
    <>
      {navigation}
      {!compact && <div className="canvas-top-actions">{actions}</div>}
      <div
        className="canvas-tool-dock"
        role="group"
        aria-label={t('Canvas tools')}
      >
        {!preview && (
          <>
            <button
              className="button"
              aria-label={
                compact ? t('Select multiple items') : t('Select tool')
              }
              title={compact ? t('Select multiple items') : t('Select tool')}
              aria-pressed={compact ? multiSelect : tool === 'select'}
              onClick={handleClick}
            >
              <MousePointer2 size={17} />
            </button>
            {!compact && (
              <>
                <button
                  className="button"
                  title={t('Pan tool')}
                  aria-label={t('Pan tool')}
                  aria-pressed={tool === 'pan'}
                  onClick={() => onTool('pan')}
                >
                  <Hand size={17} />
                </button>
                <button
                  className="button"
                  disabled={readOnly}
                  title={t('Connect tool')}
                  aria-label={t('Connect tool')}
                  aria-pressed={tool === 'connect'}
                  onClick={() => onTool('connect')}
                >
                  <Link2 size={17} />
                </button>
              </>
            )}
          </>
        )}
        {compact && actions}
        {children}
      </div>
    </>
  )
}
