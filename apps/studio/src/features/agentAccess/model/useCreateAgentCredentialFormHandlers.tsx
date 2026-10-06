import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { AgentCredential } from '@pomegranate/domain/agentAccess'
import { useCallback } from 'react'

import type { CreateAgentCredentialFormHandlersProps } from '../types/useCreateAgentCredentialFormHandlersProps.ts'
export function useCreateAgentCredentialFormHandlers({
  setBusy,
  setError,
  setSecret,
  workspaceId,
  name,
  scope,
  days,
  setCredentials,
}: CreateAgentCredentialFormHandlersProps) {
  const { t } = useTranslation()

  const handleSubmit = useCallback<
    (e: import('react').SubmitEvent<HTMLFormElement>) => Promise<void>
  >(
    async (e) => {
      e.preventDefault()
      setBusy(true)
      setError('')
      setSecret('')
      try {
        const result = await request<{
          credential: AgentCredential
          token: string
        }>('/api/agent-access', {
          method: 'POST',
          headers: {
            ...workspaceHeaders(workspaceId),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, scope, days }),
        })
        setCredentials((items) => [result.credential, ...items])
        setSecret(result.token)
      } catch (e) {
        setError(
          e instanceof Error ? e.message : t('Could not create credential.'),
        )
      } finally {
        setBusy(false)
      }
    },
    [
      setBusy,
      setError,
      setSecret,
      workspaceId,
      name,
      scope,
      days,
      setCredentials,
      t,
    ],
  )
  return { handleSubmit }
}
