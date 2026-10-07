import { useCallback, useRef } from 'react'
import { X } from 'lucide-react'
import { useDraggableSurface, useCompactLayout } from '../model/index.ts'
import { useTranslation } from '../i18n/index.ts'
import { SurfaceGrip } from './SurfaceGrip.tsx'
import { StudioDrawer } from './StudioDrawer.tsx'
import type { StudioModalProps } from '../types/studioModalProps.ts'
export function StudioModal({ title, close, children }: StudioModalProps) {
  const { t } = useTranslation()
  const compact = useCompactLayout()
  const surface = useRef<HTMLDivElement>(null)
  useDraggableSurface(surface)
  const change = useCallback(
    (open: boolean) => {
      if (!open) close()
    },
    [close],
  )
  const content = (
    <div
      ref={surface}
      className="modal"
      role={compact ? undefined : 'dialog'}
      aria-modal={compact ? undefined : true}
      aria-labelledby="modal-title"
    >
      <SurfaceGrip />
      <button
        className="icon-button modal-close"
        aria-label={t('Close dialog')}
        onClick={close}
      >
        <X size={18} />
      </button>
      {children}
    </div>
  )
  if (compact)
    return (
      <StudioDrawer open onOpenChange={change} title={title}>
        {content}
      </StudioDrawer>
    )
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) close()
      }}
    >
      {content}
    </div>
  )
}
