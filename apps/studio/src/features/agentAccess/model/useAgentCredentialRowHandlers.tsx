import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import { useCallback } from 'react'

import type { AgentCredentialRowHandlersProps } from '../types/useAgentCredentialRowHandlersProps.ts'
export function useAgentCredentialRowHandlers({
  setBusy,
  setError,
  credential,
  workspaceId,
  setCredentials,
  setSecret,
  t,
}: AgentCredentialRowHandlersProps) {
  const handleClick = useCallback<() => Promise<void>>(async () => {
    setBusy(true)
    setError('')
    try {
      await request(`/api/agent-access/${credential.id}`, {
        method: 'DELETE',
        headers: workspaceHeaders(workspaceId),
      })
      setCredentials((items) =>
        items.filter((item) => item.id !== credential.id),
      )
      setSecret('')
    } catch {
      setError(t('Could not revoke this credential. Try again.'))
    } finally {
      setBusy(false)
    }
  }, [setBusy, setError, credential, workspaceId, setCredentials, setSecret, t])
  return { handleClick }
}
