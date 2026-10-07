import { useWorkspaceRole } from '@/entities/workspace/index.ts'
import { useCallback, useMemo, useRef, type KeyboardEvent } from 'react'
import { File, MoreHorizontal } from 'lucide-react'
import { EditorContextMenu, EditorActionMenu } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { DesignPageRowProps } from '../types/designPageRowProps.ts'
export function DesignPageRow({ page, model }: DesignPageRowProps) {
  const { t } = useTranslation()
  const role = useWorkspaceRole()
  const canEdit = role !== 'viewer' && role !== null
  const renameInput = useRef<HTMLInputElement>(null)
  const cancelRename = useRef(false)
  const rename = useCallback(() => {
    cancelRename.current = false
    model.patch({ renamingPageId: page.id, renameDraft: page.name })
  }, [model, page.id, page.name])
  const finish = useCallback(() => {
    if (!cancelRename.current && model.renameDraft.trim())
      model.renamePage(model.renameDraft, page.id)
    model.patch({ renamingPageId: null })
  }, [model, page.id])
  const key = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        finish()
      }
      if (event.key === 'Escape') {
        cancelRename.current = true
        event.preventDefault()
        model.patch({ renamingPageId: null })
      }
      event.stopPropagation()
    },
    [finish, model],
  )
  const actions = useMemo(
    () => [
      { id: 'rename', label: t('Rename page'), run: rename },
      {
        id: 'add',
        label: t('Add page'),
        disabled: model.pages.length >= 30,
        run: model.addPage,
      },
      {
        id: 'delete',
        label: t('Delete page'),
        disabled: model.pages.length < 2,
        danger: true,
        separator: true,
        run: () => model.deletePage(page.id),
      },
    ],
    [model, page.id, rename, t],
  )
  return (
    <EditorContextMenu
      disabled={!canEdit}
      actions={actions}
      label={t('Page actions')}
      focusAfterClose={renameInput}
    >
      <div
        className={`design-page-row${page.id === model.page.id ? ' active' : ''}`}
      >
        {model.renamingPageId === page.id ? (
          <input
            ref={renameInput}
            autoFocus
            aria-label={t('Page name')}
            value={model.renameDraft}
            maxLength={120}
            onFocus={(event) => event.target.select()}
            onChange={(event) =>
              model.patch({ renameDraft: event.target.value })
            }
            onKeyDown={key}
            onBlur={finish}
          />
        ) : (
          <button
            className="design-page-select"
            onClick={() => model.selectPage(page.id)}
            aria-current={page.id === model.page.id ? 'page' : undefined}
            title={page.name}
          >
            <File size={14} />
            <span>{page.name}</span>
          </button>
        )}
        {canEdit && (
          <EditorActionMenu
            actions={actions}
            label={t('Page actions')}
            focusAfterClose={renameInput}
          >
            <button className="icon-button" aria-label={t('Page actions')}>
              <MoreHorizontal size={15} />
            </button>
          </EditorActionMenu>
        )}
      </div>
    </EditorContextMenu>
  )
}
