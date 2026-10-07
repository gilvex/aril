import { StudioDrawer } from '@/shared/ui/index.tsx'
import { File, X } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import { DesignPagesList } from './DesignPagesList.tsx'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
export function DesignPagesDrawer({
  model,
  onOpenChange,
}: DesignEditorProps & { onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation()
  return (
    <StudioDrawer
      open={model.pagesOpen}
      onOpenChange={onOpenChange}
      title={t('Pages')}
      trigger={
        <button
          className="design-page-picker-toggle"
          aria-label={t('Choose page: {{name}}', { name: model.page.name })}
        >
          <File size={17} />
          <span>{t('Pages')}</span>
        </button>
      }
    >
      <div className="design-page-popover">
        <header>
          <h2>{t('Pages')}</h2>
          <button
            className="icon-button"
            aria-label={t('Close panel')}
            onClick={() => onOpenChange(false)}
          >
            <X size={18} />
          </button>
        </header>
        <DesignPagesList model={model} />
      </div>
    </StudioDrawer>
  )
}
