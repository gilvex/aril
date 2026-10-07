import { Dialog } from 'radix-ui'
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
    <Dialog.Root open={model.pagesOpen} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button
          className="design-page-picker-toggle"
          aria-label={t('Choose page: {{name}}', { name: model.page.name })}
        >
          <File size={18} />
          <span>{t('Pages')}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal
        container={(document.fullscreenElement as HTMLElement) || undefined}
      >
        <Dialog.Overlay className="design-pages-drawer-backdrop" />
        <Dialog.Content
          className="design-page-popover design-pages-drawer"
          aria-describedby={undefined}
        >
          <header>
            <Dialog.Title>{t('Pages')}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label={t('Close panel')}>
              <X size={18} />
            </Dialog.Close>
          </header>
          <DesignPagesList model={model} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
