import { useDesignPanel } from '../model/useDesignPanel.ts'
import { PanelsTopLeft } from 'lucide-react'
import { EditorActionMenu } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignPanelProps } from '../types/designPanelProps.ts'
import { DesignPanelCorner } from './DesignPanelCorner.tsx'
export function DesignPanel({ model, side, children }: DesignPanelProps) {
  const { t } = useTranslation()
  const {
    ref,
    left,
    edge,
    horizontal,
    layout,
    rect,
    limit,
    heightLimit,
    resize,
    resizeHeight,
    actions,
  } = useDesignPanel(model, side)
  return (
    <div
      ref={ref}
      className={`design-panel design-panel-${side}`}
      data-docked={edge || undefined}
      data-horizontal={horizontal || undefined}
      hidden={!!layout.group && model.dockActive !== side}
      style={rect}
    >
      {children}
      <EditorActionMenu actions={actions} label={t('Panel layout')}>
        <button
          className="icon-button design-panel-dock"
          aria-label={t('Panel layout')}
          title={t('Panel layout')}
        >
          <PanelsTopLeft size={16} />
        </button>
      </EditorActionMenu>
      {!horizontal && (
        <div
          className="design-panel-resize"
          data-edge={edge || side}
          role="separator"
          tabIndex={0}
          aria-label={t(
            left ? 'Resize layers panel' : 'Resize properties panel',
          )}
          aria-orientation="vertical"
          aria-valuemin={Math.min(left ? 280 : 220, limit)}
          aria-valuemax={Math.floor(limit)}
          aria-valuenow={Math.round(rect.width)}
          title={t(
            'Drag to resize · Arrow keys to adjust · Double-click to reset',
          )}
          {...resize}
        />
      )}
      {(!edge || horizontal) && (
        <div
          className="design-panel-height-resize"
          data-edge={edge || 'floating'}
          role="separator"
          tabIndex={0}
          aria-label={t(
            left ? 'Resize layers height' : 'Resize properties height',
          )}
          aria-orientation="horizontal"
          aria-valuemin={Math.min(180, heightLimit)}
          aria-valuemax={Math.floor(heightLimit)}
          aria-valuenow={Math.round(
            horizontal && edge ? layout.insets[edge] : rect.height,
          )}
          title={t(
            'Drag to resize · Arrow keys to adjust · Double-click to reset',
          )}
          {...resizeHeight}
        />
      )}
      {!edge && (
        <DesignPanelCorner
          model={model}
          side={side}
          width={rect.width}
          height={rect.height}
          widthLimit={limit}
          heightLimit={heightLimit}
        />
      )}
    </div>
  )
}
