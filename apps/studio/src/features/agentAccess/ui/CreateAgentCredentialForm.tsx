import { StudioSelect } from '@/shared/ui/index.tsx'
import { Spinner } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCreateAgentCredentialFormHandlers } from '../model/useCreateAgentCredentialFormHandlers.tsx'

import type { CreateAgentCredentialFormProps } from '../types/createAgentCredentialFormProps.ts'
export function CreateAgentCredentialForm({
  setBusy,
  setError,
  setSecret,
  workspaceId,
  setCredentials,
  name,
  setName,
  scope,
  setScope,
  target,
  setTarget,
  days,
  setDays,
  busy,
  loading,
}: CreateAgentCredentialFormProps) {
  const { t } = useTranslation()

  const { handleSubmit } = useCreateAgentCredentialFormHandlers({
    setBusy,
    setError,
    setSecret,
    workspaceId,
    name,
    scope,
    target,
    days,
    setCredentials,
  })
  return (
    <form onSubmit={handleSubmit}>
      <label>
        {t('Connection name')}
        <input
          name="agent-connection-name"
          autoComplete="off"
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        {t('Connect to')}
        <StudioSelect
          aria-label={t('Connect to')}
          value={target}
          onChange={(e) => setTarget(e.target.value as 'account' | 'workspace')}
        >
          <option value="account">
            {t('My account — all accessible files')}
          </option>
          <option value="workspace">{t('This file only')}</option>
        </StudioSelect>
      </label>
      <p className="muted">
        {target === 'account'
          ? t(
              'Includes current and future files you can access. File permissions still apply; viewers cannot edit.',
            )
          : t('This connection can only access the current file.')}
      </p>
      <div className="agent-access-options">
        <label>
          {t('Access')}
          <StudioSelect
            aria-label={t('Access')}
            value={scope}
            onChange={(e) => setScope(e.target.value as 'read' | 'write')}
          >
            <option value="read">{t('Read only')}</option>
            <option value="write">{t('Read and edit')}</option>
          </StudioSelect>
        </label>
        <label>
          {t('Expires in')}
          <StudioSelect
            aria-label={t('Expires in')}
            value={String(days)}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>{t('7 days')}</option>
            <option value={30}>{t('30 days')}</option>
            <option value={90}>{t('90 days')}</option>
          </StudioSelect>
        </label>
      </div>
      <button
        className="button primary"
        disabled={busy || loading || !name.trim()}
      >
        {busy && <Spinner />}
        {t('Create credential')}
      </button>
    </form>
  )
}
