import { Grip } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useDesignPanelCornerResize } from '../model/useDesignPanelCornerResize.ts'
import type { DesignPanelCornerProps } from '../types/designPanelCornerProps.ts'
export function DesignPanelCorner(props: DesignPanelCornerProps) {
  const { t } = useTranslation()
  const resize = useDesignPanelCornerResize(props)
  return (
    <div
      className="design-panel-corner-resize"
      role="button"
      tabIndex={0}
      aria-label={t(
        props.side === 'left'
          ? 'Resize layers width and height'
          : 'Resize properties width and height',
      )}
      title={t(
        'Drag corner to resize both dimensions · Arrow keys to adjust · Double-click to reset',
      )}
      {...resize}
    >
      <Grip size={14} aria-hidden="true" />
    </div>
  )
}
