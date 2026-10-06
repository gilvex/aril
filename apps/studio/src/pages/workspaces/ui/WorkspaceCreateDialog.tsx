import { useCallback, useEffect, useRef, type SyntheticEvent } from 'react'
import { X } from 'lucide-react'
import type { CreateWorkspaceFormProps } from '../types/createWorkspaceFormProps.ts'
import { CreateWorkspaceForm } from './CreateWorkspaceForm.tsx'

export function WorkspaceCreateDialog(
  props: CreateWorkspaceFormProps & { error: string },
) {
  const { t, setCreating, busy } = props
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    element?.querySelector('input')?.focus()
    return () => element?.close()
  }, [])
  const close = useCallback(() => {
    if (!busy) setCreating(false)
  }, [busy, setCreating])
  const cancel = useCallback(
    (event: SyntheticEvent) => {
      event.preventDefault()
      close()
    },
    [close],
  )
  return (
    <dialog
      ref={dialog}
      className="workspace-create-dialog"
      aria-labelledby="workspace-create-title"
      onCancel={cancel}
    >
      <header>
        <h2 id="workspace-create-title">{t('New workspace')}</h2>
        <button
          className="icon-button"
          disabled={busy}
          aria-label={t('Close')}
          onClick={close}
        >
          <X size={18} />
        </button>
      </header>
      <CreateWorkspaceForm {...props} />
      {props.error && (
        <p className="form-error" role="alert">
          {props.error}
        </p>
      )}
    </dialog>
  )
}
