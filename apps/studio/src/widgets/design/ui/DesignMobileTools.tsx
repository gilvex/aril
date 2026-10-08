import { useCallback, type MouseEvent } from 'react'
import { X } from 'lucide-react'
import { StudioDrawer } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignMobilePropertyMode } from './DesignMobilePropertyMode.tsx'
import { designMobileToolPatch } from '../utils/designMobileToolPatch.ts'
import type { DesignEditorState } from '../types/designEditorState.ts'
import type { DesignMobileToolsProps } from '../types/designMobileToolsProps.ts'
import '../designMobileTools.css'

export function DesignMobileTools({
  model,
  children,
  onOpenChange,
}: DesignMobileToolsProps) {
  const { t } = useTranslation()
  const { patch } = model
  const selectTab = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      patch(
        designMobileToolPatch(
          event.currentTarget.dataset
            .tab as DesignEditorState['mobileToolsTab'],
        ),
      )
    },
    [patch],
  )
  const close = useCallback(() => onOpenChange(false), [onOpenChange])
  return (
    <StudioDrawer
      open={model.layers || model.inspector}
      onOpenChange={onOpenChange}
      title={t('Design tools')}
      modal={false}
      keepOpenOnInteract
      className="design-tools-drawer"
    >
      <header className="design-tools-header">
        <div role="group" aria-label={t('Design tools')}>
          <button
            data-tab="layers"
            aria-pressed={model.layers && model.leftTab === 'layers'}
            onClick={selectTab}
          >
            {t('Layers')}
          </button>
          <button
            data-tab="library"
            aria-pressed={model.layers && model.leftTab === 'library'}
            onClick={selectTab}
          >
            {t('Library')}
          </button>
          <button
            data-tab="properties"
            aria-pressed={model.inspector}
            onClick={selectTab}
          >
            {t('Properties')}
          </button>
        </div>
        <button
          className="icon-button"
          aria-label={t('Close panel')}
          onClick={close}
        >
          <X size={18} />
        </button>
      </header>
      {model.inspector && model.libraryView !== 'machine' && (
        <DesignMobilePropertyMode model={model} />
      )}
      <div className="design-tools-content">{children}</div>
    </StudioDrawer>
  )
}
