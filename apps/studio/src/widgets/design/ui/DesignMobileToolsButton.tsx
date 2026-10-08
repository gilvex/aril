import { useCallback } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { ActionBarButton } from 'vagabond-ui/action-bar'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { designMobileToolPatch } from '../utils/designMobileToolPatch.ts'

export function DesignMobileToolsButton({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch, layers, inspector, mobileToolsTab } = model
  const open = layers || inspector
  const toggle = useCallback(
    () =>
      patch(
        open
          ? { layers: false, inspector: false, layerActionsId: null }
          : designMobileToolPatch(mobileToolsTab),
      ),
    [open, patch, mobileToolsTab],
  )
  return (
    <ActionBarButton
      aria-label={t('Design tools')}
      title={t('Design tools')}
      aria-expanded={open}
      onClick={toggle}
    >
      <SlidersHorizontal size={18} />
    </ActionBarButton>
  )
}
