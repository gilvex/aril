import { Text } from '@/shared/ui/Text.tsx'
import './workspaceManagement.css'
import {
  useCallback,
  useEffect,
  useRef,
  type ChangeEvent,
  type SyntheticEvent,
} from 'react'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { WorkspaceManageDialogProps } from '../types/workspaceManageDialogProps.ts'
export function WorkspaceManageDialog({
  management,
  name,
  busy,
  error,
  onName,
  onClose,
  onSubmit,
}: WorkspaceManageDialogProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDialogElement>(null)
  const deleting = management.mode === 'delete'
  useEffect(() => {
    const dialog = ref.current
    dialog?.showModal()
    dialog?.querySelector('input')?.focus()
    return () => dialog?.close()
  }, [])
  const cancel = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault()
      if (!busy) onClose()
    },
    [busy, onClose],
  )
  const change = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onName(event.target.value),
    [onName],
  )
  return (
    <dialog
      ref={ref}
      className="workspace-manage-dialog"
      aria-labelledby="workspace-manage-title"
      onCancel={cancel}
    >
      <Text as="h2" id="workspace-manage-title">
        {t(deleting ? 'Delete workspace' : 'Rename workspace')}
      </Text>
      <form onSubmit={onSubmit}>
        {deleting && (
          <Text as="p">
            {t(
              'This permanently deletes all planning data and history for everyone in this workspace. Export anything you need first.',
            )}
          </Text>
        )}
        <Text as="label">
          {t(deleting ? 'Type {{name}} to confirm' : 'Workspace name', {
            name: management.studio.name,
          })}
          <input
            value={name}
            onChange={change}
            maxLength={100}
            required
            disabled={busy}
            autoComplete="off"
          />
        </Text>
        {error && (
          <Text as="p" className="form-error" role="alert">
            {t(error)}
          </Text>
        )}
        <div className="workspace-manage-buttons">
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={onClose}
          >
            <Text>{t('Cancel')}</Text>
          </button>
          <button
            className={`button ${deleting ? 'workspace-delete' : 'primary'}`}
            disabled={
              busy ||
              (deleting ? name !== management.studio.name : !name.trim())
            }
          >
            <Text>
              {t(busy ? 'Saving…' : deleting ? 'Delete workspace' : 'Save')}
            </Text>
          </button>
        </div>
      </form>
    </dialog>
  )
}
