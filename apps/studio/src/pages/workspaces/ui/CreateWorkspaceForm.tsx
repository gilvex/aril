import { Spinner } from '@/shared/ui/index.tsx'
import type { CreateWorkspaceFormProps } from '../types/createWorkspaceFormProps.ts'
export function CreateWorkspaceForm({
  handleSubmit,
  t,
  name,
  setName,
  setCreating,
  busy,
}: CreateWorkspaceFormProps) {
  return (
    <form className="workspace-create" onSubmit={handleSubmit}>
      <label>
        {t('Workspace name')}
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={t('A new idea…')}
          maxLength={100}
          required
        />
      </label>
      <p>
        {t(
          'Starts with a blank canvas. Invite collaborators from People when you’re ready.',
        )}
      </p>
      <div className="modal-actions">
        <button
          type="button"
          className="button"
          onClick={() => setCreating(false)}
          disabled={busy}
        >
          {t('Cancel')}
        </button>
        <button className="button primary" disabled={busy || !name.trim()}>
          {busy && <Spinner />}
          {busy ? t('Creating…') : t('Create workspace')}
        </button>
      </div>
    </form>
  )
}
