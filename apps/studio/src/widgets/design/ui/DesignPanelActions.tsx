import { Palette, PanelRight, PanelLeft } from 'lucide-react'
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
  return (
    <div
      className={
        'design-canvas-actions' + (boardDesign ? ' board-design-actions' : '')
      }
    >
      {boardDesign && (
        <button
          className="button"
          title={t('Pages and layers')}
          aria-label={t('Pages and layers')}
          aria-expanded={model.layers}
          onClick={() =>
            model.patch({ layers: !model.layers, inspector: false })
          }
        >
          <PanelLeft size={16} />
        </button>
      )}
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
