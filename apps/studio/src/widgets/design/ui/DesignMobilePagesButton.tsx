import { useCallback } from 'react'
import { Files } from 'lucide-react'
import { ActionBarButton } from 'vagabond-ui/action-bar'
import { useTranslation } from '@/shared/i18n/index.ts'
import { designMobileToolPatch } from '../utils/designMobileToolPatch.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'

export function DesignMobilePagesButton({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch } = model
  const open = useCallback(() => patch(designMobileToolPatch('pages')), [patch])
  return (
    <ActionBarButton
      onClick={open}
      aria-label={t('Choose page: {{name}}', { name: model.page.name })}
      title={t('Pages')}
      aria-expanded={model.pagesOpen}
    >
      <Files size={18} />
    </ActionBarButton>
  )
}
