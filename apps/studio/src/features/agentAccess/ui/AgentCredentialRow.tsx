import { useAgentCredentialRowHandlers } from '../model/useAgentCredentialRowHandlers.tsx'

import type { AgentCredentialRowProps } from '../types/agentCredentialRowProps.ts'
export function AgentCredentialRow({
  credential,
  t,
  busy,
  setBusy,
  setError,
  workspaceId,
  setCredentials,
  setSecret,
}: AgentCredentialRowProps) {
  const { handleClick } = useAgentCredentialRowHandlers({
    setBusy,
    setError,
    credential,
    workspaceId,
    setCredentials,
    setSecret,
    t,
  })
  return (
    <li key={credential.id}>
      <span>
        <strong>{credential.name}</strong>
        <small>
          {credential.scope === 'write' ? t('Read and edit') : t('Read only')} ·{' '}
          {credential.expiresAt <= Date.now() ? t('Expired') : t('Expires')}{' '}
          {new Date(credential.expiresAt).toLocaleDateString()}
        </small>
      </span>
      <button
        type="button"
        className="button"
        disabled={busy}
        aria-label={t('Revoke {{name}}', { name: credential.name })}
        onClick={handleClick}
      >
        {t('Revoke')}
      </button>
    </li>
  )
}
