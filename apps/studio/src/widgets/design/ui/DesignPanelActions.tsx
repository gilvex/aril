import { useCallback } from 'react'
import { Palette, PanelRight, Layers } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function DesignPanelActions({
  model,
  boardDesign,
}: {
  model: DesignEditorModel
  boardDesign?: boolean
}) {
  const { t } = useTranslation()
  const { patch, layers } = model
  const toggleLayers = useCallback(
    () => patch({ layers: !layers, inspector: false, pagesOpen: false }),
    [patch, layers],
  )
  return (
    <div
      className={
        'design-canvas-actions' + (boardDesign ? ' board-design-actions' : '')
      }
    >
      <button
        className="button"
        title={t('Layers')}
        aria-label={t('Layers')}
        data-design-tool="layers"
        aria-expanded={model.layers}
        onClick={toggleLayers}
      >
        <Layers size={16} />
      </button>
      <button
        className="button"
        title={t('Styles')}
        aria-label={t('Styles')}
        aria-expanded={model.inspector && model.styles}
        onClick={() => model.patch({ inspector: true, styles: true })}
      >
        <Palette size={16} />
        <span>{t('Styles')}</span>
      </button>
      <button
        className="button"
        title={t('Properties')}
        aria-label={t('Properties')}
        aria-expanded={model.inspector && !model.styles}
        onClick={() =>
          model.patch({
            inspector: !model.inspector || model.styles,
            styles: false,
          })
        }
      >
        <PanelRight size={16} />
        <span>{t('Properties')}</span>
      </button>
    </div>
  )
}
