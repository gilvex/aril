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
    days,
    setCredentials,
  })
  return (
    <form onSubmit={handleSubmit}>
      <label>
        {t('Connection name')}
        <input
          required
          maxLength={60}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <div className="agent-access-options">
        <label>
          {t('Access')}
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as 'read' | 'write')}
          >
            <option value="read">{t('Read only')}</option>
            <option value="write">{t('Read and edit')}</option>
          </select>
        </label>
        <label>
          {t('Expires in')}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>{t('7 days')}</option>
            <option value={30}>{t('30 days')}</option>
            <option value={90}>{t('90 days')}</option>
          </select>
        </label>
      </div>
      <button
        className="button primary"
        disabled={busy || loading || !name.trim()}
      >
        {t('Create credential')}
      </button>
    </form>
  )
}
