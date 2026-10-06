import type { StudioProps } from '@/pages/studio/types/studioProps.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useStudioController } from '../model/useStudioController.tsx'
import { useStudioHandlers } from '../model/useStudioHandlers.tsx'
import { StudioContent } from './StudioContent.tsx'
import { StudioDialogs } from './StudioDialogs.tsx'
import { StudioMobileMenu } from './StudioMobileMenu.tsx'

export function Studio(props: StudioProps) {
  const { t } = useTranslation()

  const model = useStudioController({ ...props, recovery: props.recovery })
  const {
    full,
    followed,
    followId,
    setFollowId,
    compact,
    sidebarOpen,
    setSidebarOpen,
  } = model
  const { handlePointerDownCapture, handleKeyDownCapture } =
    useStudioHandlers(model)
  return (
    <div
      ref={full.element}
      className={`studio-shell canvas-first top-navigation${full.fullscreen ? ' studio-fullscreen' : ''}${followed ? ' is-following' : ''}`}
      onPointerDownCapture={handlePointerDownCapture}
      onKeyDownCapture={handleKeyDownCapture}
      onWheelCapture={() => {
        if (followId) setFollowId(null)
      }}
    >
      {compact && sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label={t('Close navigation')}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {compact && <StudioMobileMenu {...props} {...model} />}
      <StudioContent {...props} {...model} />
      {model.modal && (
        <StudioDialogs {...props} {...model} modal={model.modal} />
      )}
    </div>
  )
}
