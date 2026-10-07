import { useCallback, useEffect, useRef, type SyntheticEvent } from 'react'
import { useCompactLayout, useDraggableSurface } from '@/shared/model/index.ts'
import { StudioDrawer, SurfaceGrip } from '@/shared/ui/index.tsx'
import { X } from 'lucide-react'
import type { CreateWorkspaceFormProps } from '../types/createWorkspaceFormProps.ts'
import { CreateWorkspaceForm } from './CreateWorkspaceForm.tsx'

export function WorkspaceCreateDialog(
  props: CreateWorkspaceFormProps & { error: string },
) {
  const { t, setCreating, busy } = props
  const compact = useCompactLayout()
  const dialog = useRef<HTMLDialogElement>(null)
  useDraggableSurface(dialog)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    element?.querySelector('input')?.focus()
    return () => element?.close()
  }, [compact])
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
  const change = useCallback(
    (open: boolean) => {
      if (!open) close()
    },
    [close],
  )
  const content = (
    <>
      <header>
        <SurfaceGrip />
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
    </>
  )
  if (compact)
    return (
      <StudioDrawer open onOpenChange={change} title={t('New workspace')}>
        <div className="workspace-create-dialog">{content}</div>
      </StudioDrawer>
    )
  return (
    <dialog
      ref={dialog}
      className="workspace-create-dialog"
      aria-labelledby="workspace-create-title"
      onCancel={cancel}
    >
      {content}
    </dialog>
  )
}
