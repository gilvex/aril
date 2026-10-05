import type { ReactNode } from 'react'
import { Hand, Link2, MousePointer2 } from 'lucide-react'
import { useCompactLayout } from '../../../shared/lib/use-compact-layout'

export type CanvasTool = 'select' | 'pan' | 'connect'

export function CanvasChrome({
  navigation,
  actions,
  children,
  tool,
  onTool,
  multiSelect,
  onMultiSelect,
  preview = false,
}: {
  navigation: ReactNode
  actions: ReactNode
  children: ReactNode
  tool: CanvasTool
  onTool: (tool: CanvasTool) => void
  multiSelect: boolean
  onMultiSelect: (value: boolean) => void
  preview?: boolean
}) {
  const compact = useCompactLayout()
  return (
    <>
      {navigation}
      {!compact && <div className="canvas-top-actions">{actions}</div>}
      <div className="canvas-tool-dock" role="group" aria-label="Canvas tools">
        {!preview && (
          <>
            <button
              className="button"
              aria-label={compact ? 'Select multiple items' : 'Select tool'}
              aria-pressed={compact ? multiSelect : tool === 'select'}
              onClick={() => {
                onTool('select')
                if (compact) onMultiSelect(!multiSelect)
              }}
            >
              <MousePointer2 size={17} />
              <span>{compact && multiSelect ? 'Done' : 'Select'}</span>
            </button>
            {!compact && (
              <>
                <button
                  className="button"
                  aria-label="Pan tool"
                  aria-pressed={tool === 'pan'}
                  onClick={() => onTool('pan')}
                >
                  <Hand size={17} />
                  <span>Pan</span>
                </button>
                <button
                  className="button"
                  aria-label="Connect tool"
                  aria-pressed={tool === 'connect'}
                  onClick={() => onTool('connect')}
                >
                  <Link2 size={17} />
                  <span>Connect</span>
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
