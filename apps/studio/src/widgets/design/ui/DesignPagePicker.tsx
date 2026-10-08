import { Popover } from 'radix-ui'
import { useCallback } from 'react'
import { File, ChevronDown } from 'lucide-react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignPagesList } from './DesignPagesList.tsx'
export function DesignPagePicker({ model }: DesignEditorProps) {
  const { t } = useTranslation()
  const { patch } = model
  const openChanged = useCallback(
    (open: boolean) =>
      patch({
        pagesOpen: open,
        pageQuery: '',
        renamingPageId: null,
      }),
    [patch],
  )
  return (
    <Popover.Root open={model.pagesOpen} onOpenChange={openChanged}>
      <Popover.Trigger asChild>
        <button
          className="design-page-picker-toggle"
          aria-label={t('Choose page: {{name}}', { name: model.page.name })}
        >
          <File size={15} />
          <span>{t('Pages')}</span>
          <span className="design-nav-divider">/</span>
          <strong>{model.page.name}</strong>
          <ChevronDown size={14} />
        </button>
      </Popover.Trigger>
      <Popover.Portal
        container={(document.fullscreenElement as HTMLElement) || undefined}
      >
        <Popover.Content
          className="design-page-popover"
          aria-label={t('Pages')}
          side="bottom"
          sideOffset={8}
          align="start"
          collisionPadding={12}
        >
          <DesignPagesList model={model} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
