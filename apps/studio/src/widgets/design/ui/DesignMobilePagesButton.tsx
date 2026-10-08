import { useCallback } from 'react'
import { Files } from 'lucide-react'
import { StudioActionButton } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { designMobileToolPatch } from '../utils/designMobileToolPatch.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'

export function DesignMobilePagesButton({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch } = model
  const open = useCallback(() => patch(designMobileToolPatch('pages')), [patch])
  return (
    <StudioActionButton
      onClick={open}
      aria-label={t('Choose page: {{name}}', { name: model.page.name })}
      title={t('Pages')}
      aria-expanded={model.pagesOpen}
    >
      <Files size={18} />
    </StudioActionButton>
  )
}
