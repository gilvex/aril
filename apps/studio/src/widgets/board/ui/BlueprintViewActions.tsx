import { useTranslation } from '@/shared/i18n/index.ts'
import {
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'

import type { BlueprintViewActionsProps } from '../types/blueprintViewActionsProps.ts'
export function BlueprintViewActions({
  inspectorToggle,
  inspectorOpen,
  setInspectorOpen,
  fullscreenButtonRef,
  fullscreen,
  toggleFullscreen,
}: BlueprintViewActionsProps) {
  const { t } = useTranslation()

  return (
    <>
      <button
        ref={inspectorToggle}
        className="button"
        aria-label={
          inspectorOpen ? t('Hide board details') : t('Show board details')
        }
        title={
          inspectorOpen ? t('Hide board details') : t('Show board details')
        }
        aria-expanded={inspectorOpen}
        aria-controls="board-inspector"
        onClick={() => setInspectorOpen(!inspectorOpen)}
      >
        {inspectorOpen ? (
          <PanelRightClose size={16} />
        ) : (
          <PanelRightOpen size={16} />
        )}
        <span className="touch-tool-label">{t('Details')}</span>
      </button>
      <button
        ref={fullscreenButtonRef}
        className="button fullscreen-toggle"
        aria-label={
          fullscreen ? t('Exit fullscreen') : t('Expand canvas to fullscreen')
        }
        aria-pressed={fullscreen}
        title={
          fullscreen
            ? t('Exit fullscreen (Esc)')
            : t('Expand canvas to fullscreen')
        }
        onClick={() => void toggleFullscreen()}
      >
        {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        <span>{fullscreen ? t('Exit fullscreen') : t('Fullscreen')}</span>
      </button>
    </>
  )
}
