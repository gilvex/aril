import { useCallback, type SubmitEvent } from 'react'
import { Button } from 'vagabond-ui/button'
import { Input } from 'vagabond-ui/input'
import type { Profile } from '@aril/domain/collaboration'
import { useTranslation } from '@/shared/i18n/index.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import type { UsernameEditorProps } from '../types/index.ts'
import { useInvitationModel } from '../model/useInvitationModel.ts'
import { suggestUsername } from '../utils/suggestUsername.ts'
import './invitations.css'
export function UsernameEditor({
  profile,
  onProfile,
  setup = false,
}: UsernameEditorProps) {
  const { t } = useTranslation(),
    { value, set, run, busy, error, message } = useInvitationModel({
      value: setup ? suggestUsername(profile.name) : profile.username || '',
    })
  const username = value.trim().toLowerCase()
  const valid =
    /^[a-z][a-z0-9_]{2,29}$/.test(username) && !username.startsWith('user_')
  const suggest = useCallback(() => {
    set({
      value: suggestUsername(profile.name, crypto.randomUUID()),
      error: '',
      message: '',
    })
  }, [profile.name, set])
  const submit = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!valid || busy) return
      const result = await run<{ profile: Profile }>('/api/username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      if (result) {
        onProfile(result.profile)
        set({
          value: result.profile.username || username,
          message: 'Username saved.',
        })
      }
    },
    [username, valid, busy, run, onProfile, set],
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
          onChange={(event) =>
            set({ value: event.target.value, error: '', message: '' })
          }
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          disabled={busy || isDemoMode()}
          maxLength={30}
        />
      </label>
      {!setup && (
        <small className="current-username">@{profile.username}</small>
      )}
      <p>{t('People can find you by username or your exact email address.')}</p>
      <p>
        {t(
          'Use 3–30 letters, numbers or underscores. Start with a letter; user_ is reserved.',
        )}
      </p>
      {setup && (
        <Button
          type="button"
          variant="ghost"
          className="button username-suggestion"
          disabled={busy}
          onClick={suggest}
        >
          {t('Suggest another username')}
        </Button>
      )}
      {error && <p role="alert">{t(error)}</p>}
      {message && <p role="status">{t(message)}</p>}
      <Button
        type="submit"
        className="button primary"
        disabled={
          busy || !valid || username === profile.username || isDemoMode()
        }
      >
        {t(busy ? 'Saving…' : setup ? 'Save and continue' : 'Save username')}
      </Button>
    </form>
  )
}
