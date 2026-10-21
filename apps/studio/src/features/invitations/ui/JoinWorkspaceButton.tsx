import { useCallback, type SubmitEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { Input } from 'vagabond-ui/input'
import { InvitationDialog } from './InvitationDialog.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useInvitationModel } from '../model/useInvitationModel.ts'
import { readInviteLink } from '../utils/readInviteLink.ts'
import './invitations.css'
export function JoinWorkspaceButton() {
  const { t } = useTranslation(),
    model = useInvitationModel()
  const { set, run, open, value, busy, error } = model
  const changeOpen = useCallback(
    (open: boolean) => {
      if (!busy) set({ open, error: '', value: '' })
    },
    [set, busy],
  )
  const submit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      const token = readInviteLink(value)
      if (!token) {
        set({ error: 'Paste an invitation link from this Aril server.' })
        return
      }
      const result = await run('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      if (result) {
        set({ open: false, value: '' })
        window.dispatchEvent(new Event('aril:invitations-changed'))
      }
    },
    [run, set, value],
  )
  return (
    <>
      <Button
        className="button workspace-join"
        onClick={() => changeOpen(true)}
      >
        {t('Join workspace')}
      </Button>
      <InvitationDialog
        open={open}
        onOpenChange={changeOpen}
        title={t('Join workspace')}
        description={t('Paste the invitation link shared with you.')}
      >
        <form onSubmit={submit} className="invitation-form">
          <label>
            {t('Invite link')}
            <Input
              value={value}
              onChange={(event) => set({ value: event.target.value })}
              autoComplete="off"
              required
            />
          </label>
          {error && <p role="alert">{t(error)}</p>}
          <Button
            type="submit"
            className="button primary"
            disabled={busy || !value.trim()}
          >
            {t(busy ? 'Joining…' : 'Join workspace')}
          </Button>
        </form>
      </InvitationDialog>
    </>
  )
}
