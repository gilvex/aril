import { useCallback, useRef } from 'react'
import { PanelLeft, PanelRight, PanelsTopLeft } from 'lucide-react'
import { useDraggableSurface } from '@/shared/model/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useDesignPanelResize } from '../model/useDesignPanelResize.ts'
import { designPanelLimit } from '../utils/designPanelLimit.ts'
import type { DesignPanelProps } from '../types/designPanelProps.ts'
export function DesignPanel({ model, side, children }: DesignPanelProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const { patch } = model
  const left = side === 'left'
  const docked = left ? model.layersDocked : model.inspectorDocked
  const dock = useCallback(
    () => patch(left ? { layersDocked: true } : { inspectorDocked: true }),
    [left, patch],
  )
  const toggleDock = useCallback(
    () =>
      patch(left ? { layersDocked: !docked } : { inspectorDocked: !docked }),
    [docked, left, patch],
  )
  const changeWidth = useCallback(
    (width: number) =>
      patch(left ? { layersWidth: width } : { inspectorWidth: width }),
    [left, patch],
  )
  const limit = designPanelLimit(model, docked)
  const width = Math.min(left ? model.layersWidth : model.inspectorWidth, limit)
  useDraggableSurface(ref, docked, {
    disabled: docked,
    dockSide: side,
    onDock: dock,
  })
  const resize = useDesignPanelResize(width, limit, side, changeWidth)
  const Icon = docked ? PanelsTopLeft : left ? PanelLeft : PanelRight
  const label = t(
    docked ? 'Undock panel' : left ? 'Dock panel left' : 'Dock panel right',
  )
  return (
    <div
      ref={ref}
      className={`design-panel design-panel-${side}`}
      data-docked={docked || undefined}
      style={{ width }}
    >
      {children}
      <button
        className="icon-button design-panel-dock"
        aria-label={label}
        title={label}
        onClick={toggleDock}
      >
        <Icon size={16} />
      </button>
      <div
        className="design-panel-resize"
        role="separator"
        tabIndex={0}
        aria-label={t(left ? 'Resize layers panel' : 'Resize properties panel')}
        aria-orientation="vertical"
        aria-valuemin={220}
        aria-valuemax={Math.floor(limit)}
        aria-valuenow={Math.round(width)}
        title={t(
          'Drag to resize · Arrow keys to adjust · Double-click to reset',
        )}
        {...resize}
      />
    </div>
  )
}
