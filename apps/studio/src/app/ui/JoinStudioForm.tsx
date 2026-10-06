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
      <p>{t('Join Aril with an invitation from someone in the studio.')}</p>
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
        disabled={busy || !profile || !token.trim()}
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
