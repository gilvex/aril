import { GripHorizontal } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import './surfaceMotion.css'
export function SurfaceGrip() {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      className="surface-grip"
      aria-label={t('Move window')}
      title={t('Drag to move. Arrow keys move; Home resets.')}
    >
      <GripHorizontal size={18} />
    </button>
  )
}
