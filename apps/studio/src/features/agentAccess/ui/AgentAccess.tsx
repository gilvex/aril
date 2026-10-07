import { LoadingSkeleton } from '@/shared/ui/index.tsx'
import { createAgentAccessState } from '@/features/agentAccess/model/createAgentAccessState.ts'
import { useAgentAccessModel } from '@/features/agentAccess/model/useAgentAccessModel.ts'
import type { AgentAccessProps } from '@/features/agentAccess/types/agentAccessProps.ts'
import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { AgentCredential } from '@pomegranate/domain/agentAccess'
import { useEffect, useState } from 'react'
import { useAgentAccessHandlers } from '../model/useAgentAccessHandlers.tsx'
import { AgentCredentialRow } from './AgentCredentialRow.tsx'
import { AgentSecret } from './AgentSecret.tsx'
import { AgentSetupInstructions } from './AgentSetupInstructions.tsx'

import { CreateAgentCredentialForm } from './CreateAgentCredentialForm.tsx'

export function AgentAccess({ workspaceId }: AgentAccessProps) {
  const { t } = useTranslation()

  const {
    credentials,
    setCredentials,
    name,
    setName,
    scope,
    setScope,
    days,
    setDays,
    error,
    setError,
    busy,
    setBusy,
    loading,
    setLoading,
  } = useAgentAccessModel(() => createAgentAccessState())

  const [secret, setSecret] = useState('')

  useEffect(() => {
    let active = true
    request<AgentCredential[]>('/api/agent-access', {
      headers: workspaceHeaders(workspaceId),
    })
      .then((value) => {
        if (active) setCredentials(value)
      })
      .catch(() => {
        if (active)
          setError(
            t('Could not load agent access. Close this dialog and try again.'),
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [setCredentials, setError, setLoading, t, workspaceId])

  const { handleClick } = useAgentAccessHandlers({ secret, setError })
  return (
    <section className="agent-access">
      <h2 id="modal-title">{t('Agent access')}</h2>
      <p>
        {t(
          'Connect Codex or another MCP client to this workspace. Edits appear in revision history and team activity.',
        )}
      </p>
      <CreateAgentCredentialForm
        setBusy={setBusy}
        setError={setError}
        setSecret={setSecret}
        workspaceId={workspaceId}
        setCredentials={setCredentials}
        name={name}
        setName={setName}
        scope={scope}
        setScope={setScope}
        days={days}
        setDays={setDays}
        busy={busy}
        loading={loading}
      />
      {secret && (
        <AgentSecret t={t} secret={secret} handleClick={handleClick} />
      )}
      <AgentSetupInstructions t={t} />
      <h3>{t('Your connections')}</h3>
      {loading ? (
        <LoadingSkeleton label={t('Loading…')} />
      ) : !credentials.length ? (
        <p>{t('No agent connections yet.')}</p>
      ) : (
        <ul className="agent-credentials">
          {credentials.map((credential) => (
            <AgentCredentialRow
              key={credential.id}
              credential={credential}
              t={t}
              busy={busy}
              setBusy={setBusy}
              setError={setError}
              workspaceId={workspaceId}
              setCredentials={setCredentials}
              setSecret={setSecret}
            />
          ))}
        </ul>
      )}
      {error && <p role="status">{error}</p>}
    </section>
  )
}
