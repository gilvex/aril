import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useCallback } from 'react'

import type { CollaborationPopoverHandlersProps } from '../types/useCollaborationPopoverHandlersProps.ts'
export function useCollaborationPopoverHandlers({
  setPanel,
  opener,
  setBusy,
  workspaceId,
  setInvite,
  setCopied,
  setError,
  invite,
}: CollaborationPopoverHandlersProps) {
  const { t } = useTranslation()

  const handleCloseCollaborationPanelClick = useCallback<() => void>(() => {
    setPanel(null)
    opener.current?.focus()
  }, [setPanel, opener])
  const createInvite = useCallback<() => Promise<void>>(async () => {
    setBusy(true)
    try {
      const result = await request<{ token: string }>('/api/invites', {
        method: 'POST',
        headers: workspaceHeaders(workspaceId),
      })
      setInvite(`${location.origin}/#invite=${result.token}`)
      setCopied(false)
    } catch (err) {
      setError(String(err))
    } finally {
      setBusy(false)
    }
  }, [setBusy, workspaceId, setInvite, setCopied, setError])
  const copyInvite = useCallback<() => Promise<void>>(async () => {
    try {
      await navigator.clipboard.writeText(invite)
      setCopied(true)
    } catch {
      setError(t('Select and copy the invite link above.'))
    }
  }, [invite, setCopied, setError, t])
  return { handleCloseCollaborationPanelClick, createInvite, copyInvite }
}
