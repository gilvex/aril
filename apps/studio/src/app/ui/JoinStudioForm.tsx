import { Spinner } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useJoinStudioFormHandlers } from '../model/useJoinStudioFormHandlers.tsx'

import type { JoinStudioFormProps } from '../types/joinStudioFormProps.ts'
export function JoinStudioForm({
  setBusy,
  setError,
  token,
  profile,
  name,
  setProfile,
  setInviteRequired,
  setToken,
  setName,
  busy,
}: JoinStudioFormProps) {
  const { t } = useTranslation()

  const { handleSubmit } = useJoinStudioFormHandlers({
    setBusy,
    setError,
    token,
    profile,
    name,
    setProfile,
    setInviteRequired,
    setToken,
  })
  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <p>
        {t('Join Pomegranate with an invitation from someone in the studio.')}
      </p>
      {!profile && (
        <label>
          {t('Your name')}
          <input
            autoComplete="nickname"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={60}
          />
        </label>
      )}
      <label>
        {t('Invite code')}
        <input
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
          autoComplete="off"
        />
      </label>
      <button
        className="button primary"
        disabled={busy || (!profile && !name.trim()) || !token.trim()}
      >
        {busy && <Spinner />}
        {busy
          ? t('Joining…')
          : profile
            ? t('Accept invitation as {{name}}', { name: profile.name })
            : t('Join studio')}
      </button>
    </form>
  )
}
