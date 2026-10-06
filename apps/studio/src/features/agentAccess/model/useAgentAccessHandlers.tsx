import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'

import type { AgentAccessHandlersProps } from '../types/useAgentAccessHandlersProps.ts'
export function useAgentAccessHandlers({
  secret,
  setError,
}: AgentAccessHandlersProps) {
  const { t } = useTranslation()

  const handleClick = useCallback<() => Promise<void>>(async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setError(t('Credential copied.'))
    } catch {
      setError(t('Select the credential field and copy it manually.'))
    }
  }, [secret, setError, t])
  return { handleClick }
}
