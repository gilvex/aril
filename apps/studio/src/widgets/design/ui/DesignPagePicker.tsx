import { Popover } from 'radix-ui'
import { useCallback } from 'react'
import { File, ChevronDown, Plus, Search } from 'lucide-react'
import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignEditorProps } from '../types/designEditorProps.ts'
import { DesignPageRow } from './DesignPageRow.tsx'
export function DesignPagePicker({
  model,
  mobile = false,
}: DesignEditorProps & { mobile?: boolean }) {
  const { t } = useTranslation()
  const role = useWorkspaceRole()
  const canEdit = role !== 'viewer' && role !== null
  const { patch } = model
  const focusSearch = useCallback(
    (event: Event) => {
      if (mobile) event.preventDefault()
    },
    [mobile],
  )
  const openChanged = useCallback(
    (open: boolean) =>
      patch({
        pagesOpen: open,
        pageQuery: '',
        renamingPageId: null,
        ...(open ? { layers: false, inspector: false } : {}),
      }),
    [patch],
  )
  const pages = model.pages.filter((page) =>
    page.name
      .toLocaleLowerCase()
      .includes(model.pageQuery.trim().toLocaleLowerCase()),
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
          {!mobile && (
            <>
              <span className="design-nav-divider">/</span>
              <strong>{model.page.name}</strong>
              <ChevronDown size={14} />
            </>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal
        container={(document.fullscreenElement as HTMLElement) || undefined}
      >
        <Popover.Content
          className="design-page-popover"
          onOpenAutoFocus={focusSearch}
          aria-label={t('Pages')}
          side={mobile ? 'top' : 'bottom'}
          sideOffset={8}
          align="start"
          collisionPadding={12}
        >
          <label className="design-page-search">
            <Search size={15} aria-hidden="true" />
            <input
              aria-label={t('Find a page')}
              placeholder={t('Find a page')}
              value={model.pageQuery}
              onChange={(event) => patch({ pageQuery: event.target.value })}
            />
          </label>
          <div className="design-page-picker-list">
            {pages.map((page) => (
              <DesignPageRow key={page.id} page={page} model={model} />
            ))}
            {!pages.length && <p role="status">{t('No matching pages.')}</p>}
          </div>
          {canEdit && (
            <button
              className="design-page-add"
              disabled={model.pages.length >= 30}
              onClick={model.addPage}
            >
              <Plus size={15} />
              {t('Add page')}
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
