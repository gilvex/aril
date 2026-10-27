import { InvitationInboxContent } from './InvitationInboxContent.tsx'
import { useCallback, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { Button } from 'vagabond-ui/button'
import { InvitationDialog } from './InvitationDialog.tsx'
import type { AccountInvitation } from '@aril/domain/invitations'
import { request } from '@/shared/api/request.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useInvitationModel } from '../model/useInvitationModel.ts'
import './invitations.css'
export function InvitationInbox() {
  const { t } = useTranslation(),
    { set, run, store, open, invitations, busy, error, message, loaded } =
      useInvitationModel()
  const trigger = useRef<HTMLButtonElement>(null)
  const revision = useRef(0)
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      if (store.getState().busy) return
      const current = ++revision.current
      try {
        const invitations = await request<AccountInvitation[]>(
          '/api/notifications',
          { signal },
        )
        if (!signal?.aborted && current === revision.current)
          set({ invitations, loaded: true, error: '' })
      } catch (error) {
        if (!signal?.aborted && current === revision.current)
          set({
            loaded: true,
            error:
              error instanceof Error
                ? error.message
                : 'Could not load invitations.',
          })
      }
    },
    [set, store],
  )
  useEffect(() => {
    const controller = new AbortController()
    const load = () => {
      if (
        document.visibilityState === 'visible' &&
        trigger.current?.getClientRects().length
      )
        void refresh(controller.signal)
    }
    load()
    const timer = setInterval(load, 30000)
    window.addEventListener('focus', load)
    return () => {
      controller.abort()
      clearInterval(timer)
      window.removeEventListener('focus', load)
    }
  }, [refresh])
  const change = useCallback(
    (open: boolean) => {
      if (!busy) {
        set({ open, error: '', message: '' })
        if (open) void refresh()
      }
    },
    [set, busy, refresh],
  )
  const decide = useCallback(
    async (id: string, decision: 'accept' | 'decline') => {
      revision.current++
      const result = await run('/api/notifications/' + id + '/' + decision, {
        method: 'POST',
      })
      if (result) {
        revision.current++
        set({
          invitations: store
            .getState()
            .invitations.filter((item) => item.id !== id),
          message:
            decision === 'accept'
              ? 'Invitation accepted. Your workspace is available in Workspaces.'
              : 'Invitation declined.',
        })
        window.dispatchEvent(new Event('aril:invitations-changed'))
      }
    },
    [run, set, store],
  )
  return (
    <>
      <Button
        ref={trigger}
        className="icon-button invitation-bell"
        aria-label={t('Notifications')}
        onClick={() => change(true)}
      >
        <Bell size={18} />
        {invitations.length > 0 && (
          <span className="invitation-count">{invitations.length}</span>
        )}
      </Button>
      <InvitationDialog
        open={open}
        onOpenChange={change}
        title={t('Notifications')}
        description={t('Workspace invitations for your account.')}
      >
        <InvitationInboxContent
          invitations={invitations}
          busy={busy}
          error={error}
          message={message}
          loaded={loaded}
          decide={decide}
        />
      </InvitationDialog>
    </>
  )
}
