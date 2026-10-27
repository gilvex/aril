import { Text } from '@/shared/ui/Text.tsx'
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
      <Text as="span">
        <Text as="strong">{credential.name}</Text>
        <Text as="small">
          {credential.target === 'account'
            ? t('Account access')
            : t('This file only')}{' '}
          · {credential.scope === 'write' ? t('Read and edit') : t('Read only')}{' '}
          · {credential.expiresAt <= Date.now() ? t('Expired') : t('Expires')}{' '}
          {new Date(credential.expiresAt).toLocaleDateString()}
        </Text>
      </Text>
      <button
        type="button"
        className="button"
        disabled={busy}
        aria-label={t('Revoke {{name}}', { name: credential.name })}
        onClick={handleClick}
      >
        <Text>{t('Revoke')}</Text>
      </button>
    </li>
  )
}
