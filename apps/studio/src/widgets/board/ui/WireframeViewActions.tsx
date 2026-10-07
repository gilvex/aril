import { useTranslation } from '@/shared/i18n/index.ts'
import {
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'

import type { WireframeViewActionsProps } from '../types/wireframeViewActionsProps.ts'
export function WireframeViewActions({
  inspectorToggle,
  inspectorOpen,
  setInspectorOpen,
  full,
}: WireframeViewActionsProps) {
  const { t } = useTranslation()

  return (
    <>
      <button
        ref={inspectorToggle}
        className="button"
        aria-label={
          inspectorOpen
            ? t('Hide wireframe details')
            : t('Show wireframe details')
        }
        title={
          inspectorOpen
            ? t('Hide wireframe details')
            : t('Show wireframe details')
        }
        aria-expanded={inspectorOpen}
        aria-controls="wireframe-inspector"
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
        ref={full.button}
        className="button fullscreen-toggle"
        aria-label={
          full.fullscreen
            ? t('Exit fullscreen')
            : t('Expand wireframes to fullscreen')
        }
        title={
          full.fullscreen
            ? t('Exit fullscreen')
            : t('Expand wireframes to fullscreen')
        }
        aria-pressed={full.fullscreen}
        onClick={() => void full.toggle()}
      >
        {full.fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        <span className="touch-tool-label">{t('Expand')}</span>
      </button>
    </>
  )
}
