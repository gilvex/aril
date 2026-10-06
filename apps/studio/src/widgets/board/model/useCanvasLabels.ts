import { useMemo } from 'react'
import type { AriaLabelConfig } from '@xyflow/react'
import { useTranslation } from '@/shared/i18n/index.ts'

export function useCanvasLabels() {
  const { t } = useTranslation()
  return useMemo<Partial<AriaLabelConfig>>(
    () => ({
      'controls.zoomIn.ariaLabel': t('Zoom in'),
      'controls.zoomOut.ariaLabel': t('Zoom out'),
      'controls.fitView.ariaLabel': t('Fit view'),
      'controls.ariaLabel': t('Canvas controls'),
      'minimap.ariaLabel': t('Canvas minimap'),
    }),
    [t],
  )
}
