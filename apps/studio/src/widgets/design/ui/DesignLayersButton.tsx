import { useCallback } from 'react'
import { Layers } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignLayersButton({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch, layers } = model
  const toggle = useCallback(
    () =>
      patch({
        layers: model.leftTab !== 'layers' || !layers,
        leftTab: 'layers',
        dockActive: 'left',
        ...(model.compact ? { inspector: false } : {}),
        pagesOpen: false,
      }),
    [patch, layers, model.compact, model.leftTab],
  )
  return (
    <button
      className="button design-layers-toggle"
      title={t('Layers')}
      aria-label={t('Layers')}
      data-design-tool="layers"
      aria-expanded={layers}
      onClick={toggle}
    >
      <Layers size={18} />
      <span>{t('Layers')}</span>
    </button>
  )
}
