import { Text } from '@/shared/ui/Text.tsx'
import { useCallback } from 'react'
import { Palette, PanelRight } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorModel } from '../types/designEditorModel.ts'
export function DesignPanelActions({
  model,
  boardDesign,
  mobile,
}: {
  model: DesignEditorModel
  boardDesign?: boolean
  mobile?: boolean
}) {
  const { t } = useTranslation()
  const { patch, inspector, styles } = model
  const toggleStyles = useCallback(
    () =>
      patch({
        inspector: !inspector || !styles,
        styles: true,
        ...(mobile ? { layers: false } : {}),
        pagesOpen: false,
      }),
    [patch, inspector, styles, mobile],
  )
  const toggleProperties = useCallback(
    () =>
      patch({
        inspector: !inspector || styles,
        styles: false,
        ...(mobile ? { layers: false } : {}),
        pagesOpen: false,
      }),
    [patch, inspector, styles, mobile],
  )
  if (model.libraryView === 'variables') return null
  return (
    <div
      className={
        mobile
          ? 'design-mobile-panel-actions'
          : 'design-canvas-actions' +
            (boardDesign ? ' board-design-actions' : '')
      }
    >
      {model.libraryView !== 'machine' && (
        <button
          className="button"
          title={t('Styles')}
          aria-label={t('Styles')}
          aria-expanded={inspector && styles}
          onClick={toggleStyles}
        >
          <Palette size={18} />
          <Text as="span">{t('Styles')}</Text>
        </button>
      )}
      <button
        className="button"
        title={t('Properties')}
        aria-label={t('Properties')}
        aria-expanded={inspector && !styles}
        onClick={toggleProperties}
      >
        <PanelRight size={18} />
        <Text as="span">{t('Properties')}</Text>
      </button>
    </div>
  )
}
