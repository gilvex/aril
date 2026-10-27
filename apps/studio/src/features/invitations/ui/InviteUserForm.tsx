import { Text } from '@/shared/ui/Text.tsx'
import { useCallback, type SubmitEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { Input } from 'vagabond-ui/input'
import { Mail, UserRound } from 'lucide-react'
import { StudioSelect } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useInvitationModel } from '../model/useInvitationModel.ts'
import { useInvitationSearch } from '../model/useInvitationSearch.ts'
import type { InviteUserFormProps } from '../types/index.ts'
import './invitations.css'
export function InviteUserForm({ workspaceId }: InviteUserFormProps) {
  const { t } = useTranslation(),
    { set, run, value, selected, users, role, busy, error, message } =
      useInvitationModel()
  useInvitationSearch(workspaceId, value, selected, set)
  const submit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      const result = await run<{ delivery: string }>(
        '/api/account-invitations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-workspace-id': workspaceId,
          },
          body: JSON.stringify({
            ...(selected ? { userId: selected.id } : { email: value.trim() }),
            role,
          }),
        },
      )
      if (result)
        set({
          value: '',
          selected: null,
          users: [],
          message:
            result.delivery === 'sent'
              ? 'Invitation created and email sent.'
              : result.delivery === 'unconfigured'
                ? 'In-app invitation created. Email is not configured on this server.'
                : 'In-app invitation created, but email delivery failed. Please try again later.',
        })
    },
    [run, set, selected, value, role, workspaceId],
  )
  return (
    <form className="invitation-form invite-user" onSubmit={submit}>
      <Text as="h3">{t('Invite people')}</Text>
      <Text as="label">
        {t('Email or username')}
        <Input
          aria-label={t('Email or username')}
          value={value}
          onChange={(event) =>
            set({ value: event.target.value, selected: null })
          }
          autoComplete="off"
          placeholder={t('name@example.com or @username')}
          required
          disabled={busy}
        />
      </Text>
      {!!users.length && (
        <div className="invitation-results" aria-label={t('Matching people')}>
          {users.map((user) => (
            <Button
              type="button"
              key={user.id}
              className="invitation-result"
              variant="ghost"
              onClick={() =>
                set({ selected: user, value: '@' + user.username, users: [] })
              }
            >
              <UserRound size={16} />
              <Text as="span">
                <Text as="strong">{user.name}</Text>
                <Text as="small">@{user.username}</Text>
              </Text>
            </Button>
          ))}
        </div>
      )}
      <div className="invitation-form-actions">
        <StudioSelect
          aria-label={t('Invitation role')}
          value={role}
          onChange={(event) =>
            set({ role: event.target.value as 'member' | 'viewer' })
          }
          disabled={busy}
        >
          <option value="member">{t('Editor')}</option>
          <option value="viewer">{t('Viewer')}</option>
        </StudioSelect>
        <Button
          className="button primary"
          type="submit"
          disabled={busy || (!selected && !value.includes('@'))}
        >
          <Mail size={16} />
          <Text>{t(busy ? 'Sending…' : 'Send invitation')}</Text>
        </Button>
      </div>
      {error && (
        <Text as="p" role="alert">
          {t(error)}
        </Text>
      )}
      {message && (
        <Text as="p" role="status">
          {t(message)}
        </Text>
      )}
      <Text as="p">
        {t(
          'Invitations expire after 7 days. Access starts only after acceptance.',
        )}
      </Text>
    </form>
  )
}
