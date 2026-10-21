import { useCallback, type SubmitEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { Input } from 'vagabond-ui/input'
import type { Profile } from '@aril/domain/collaboration'
import { useTranslation } from '@/shared/i18n/index.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import type { InvitationProfileProps } from '../types/index.ts'
import { useInvitationModel } from '../model/useInvitationModel.ts'
import './invitations.css'
export function UsernameEditor({ profile, onProfile }: InvitationProfileProps) {
  const { t } = useTranslation(),
    { value, set, run, busy, error, message } = useInvitationModel()
  const submit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      const result = await run<{ profile: Profile }>('/api/username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: value }),
      })
      if (result) {
        onProfile(result.profile)
        set({ value: '', message: 'Username saved.' })
      }
    },
    [value, run, onProfile, set],
  )
  if (profile.guestExpiresAt) return null
  return (
    <form onSubmit={submit} className="invitation-form username-editor">
      <label>
        {t('Username')}
        <Input
          aria-label={t('Username')}
          placeholder={profile.username || ''}
          value={value}
          onChange={(event) => set({ value: event.target.value })}
          autoComplete="username"
          maxLength={30}
        />
      </label>
      <small className="current-username">
        @{profile.username || t('Assigned when you sign in')}
      </small>
      <p>{t('People can find you by username or your exact email address.')}</p>
      {error && <p role="alert">{t(error)}</p>}
      {message && <p role="status">{t(message)}</p>}
      <Button
        type="submit"
        className="button"
        disabled={busy || !value.trim() || isDemoMode()}
      >
        {t('Save username')}
      </Button>
    </form>
  )
}
