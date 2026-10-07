import { useCallback, type MouseEvent } from 'react'
import { Plus, ArrowUpRight } from 'lucide-react'
import { request } from '@/shared/api/request.ts'
import { LoadingSkeleton } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { WorkspacePickerDialogProps } from '../types/workspacePickerDialogProps.ts'
import { useWorkspacePicker } from '../model/useWorkspacePicker.ts'
export function WorkspacePickerDialog({
  current,
  beforeLeave,
  onOpen,
  close,
}: WorkspacePickerDialogProps) {
  const { t } = useTranslation()
  const model = useWorkspacePicker(current)
  const open = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      const item = model.items.find(
        (item) => item.id === event.currentTarget.dataset.id,
      )
      if (item && (await beforeLeave())) {
        close()
        onOpen(item)
      }
    },
    [model.items, beforeLeave, close, onOpen],
  )
  const create = useCallback(async () => {
    if (!model.query.trim() || model.busy) return
    model.patch({ busy: true, error: '' })
    try {
      if (!(await beforeLeave()))
        throw Error('Finish saving before switching workspaces.')
      const studio = await request<StudioSummary>('/api/studios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: model.query.trim() }),
      })
      close()
      onOpen(studio)
    } catch {
      model.patch({ error: 'Could not create workspace. Try again.' })
    } finally {
      model.patch({ busy: false })
    }
  }, [model, beforeLeave, close, onOpen])
  const items = model.items.filter((item) =>
    item.name.toLocaleLowerCase().includes(model.query.toLocaleLowerCase()),
  )
  return (
    <div className="workspace-picker-dialog">
      <h2 id="modal-title">{t('Open workspace')}</h2>
      <input
        autoFocus
        aria-label={t('Find or create a workspace')}
        placeholder={t('Find or create a workspace')}
        maxLength={100}
        value={model.query}
        onChange={(event) => model.patch({ query: event.target.value })}
      />
      {model.loading ? (
        <LoadingSkeleton label={t('Loading...')} />
      ) : (
        <div className="workspace-picker-results">
          {items.map((item) => (
            <button
              className="button"
              key={item.id}
              data-id={item.id}
              onClick={open}
            >
              <img src="/aril.svg" width={22} alt="" />
              <span>{item.name}</span>
              <ArrowUpRight size={16} />
            </button>
          ))}
          {!items.length && <p>{t('No workspaces found.')}</p>}
        </div>
      )}
      {current.id !== 'demo' && model.query.trim() && (
        <button
          className="button primary"
          disabled={model.busy}
          onClick={create}
        >
          <Plus size={16} />
          {t('Create workspace')}: {model.query.trim()}
        </button>
      )}
      {model.error && (
        <p role="alert" className="form-error">
          {t(model.error)}
        </p>
      )}
    </div>
  )
}
