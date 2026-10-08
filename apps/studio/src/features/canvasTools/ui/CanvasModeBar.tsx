import { StudioActionBar, CursorChatButton } from '@/shared/ui/index.tsx'
import { useCanvasTools } from '../model/useCanvasTools.ts'
import { CanvasModeGroup } from './CanvasModeGroup.tsx'
import type { CanvasModeBarProps } from '../types/canvasModeBarProps.ts'
import './canvasModeBar.css'
export function CanvasModeBar({
  className = '',
  label,
  navigation,
  children,
  extras,
  onModeChange,
}: CanvasModeBarProps) {
  const { mode } = useCanvasTools()
  return (
    <StudioActionBar className={`canvas-mode-bar ${className}`} label={label}>
      <div className="canvas-navigation-tools">
        {navigation}
        <CursorChatButton />
      </div>
      <span className="canvas-tool-divider" aria-hidden="true" />
      <div className="canvas-context-tools" key={mode}>
        {children}
      </div>
      <span
        className="canvas-tool-divider canvas-mode-divider"
        aria-hidden="true"
      />
      <CanvasModeGroup onChange={onModeChange} />
      {extras && <div className="canvas-extra-tools">{extras}</div>}
    </StudioActionBar>
  )
}
