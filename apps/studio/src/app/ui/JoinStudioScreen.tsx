import { LanguagePicker } from '@/features/appearance/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useJoinStudioScreenHandlers } from '../model/useJoinStudioScreenHandlers.tsx'

import { GoogleSignIn } from '@/features/googleSignIn/index.ts'

import { JoinStudioForm } from './JoinStudioForm.tsx'

import type { JoinStudioScreenProps } from '../types/joinStudioScreenProps.ts'
export function JoinStudioScreen({
  inviteRequired,
  token,
  setBusy,
  setError,
  profile,
  name,
  setProfile,
  setInviteRequired,
  setToken,
  setName,
  busy,
  error,
}: JoinStudioScreenProps) {
  const { t } = useTranslation()

  const { handleSuccess } = useJoinStudioScreenHandlers({
    setProfile,
    setInviteRequired,
    setError,
  })
  return (
    <div className="boot-screen">
      <img src="/mark.svg" alt="" />
      <LanguagePicker />
      <h1>
        {inviteRequired || token
          ? t('Good ideas are better together.')
          : t('A little space for big ideas.')}
      </h1>
      {inviteRequired || token ? (
        <JoinStudioForm
          setBusy={setBusy}
          setError={setError}
          token={token}
          profile={profile}
          name={name}
          setProfile={setProfile}
          setInviteRequired={setInviteRequired}
          setToken={setToken}
          setName={setName}
          busy={busy}
        />
      ) : (
        <p>{error || 'Opening your shared workspace…'}</p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!profile && inviteRequired && <GoogleSignIn onSuccess={handleSuccess} />}
      {error && !inviteRequired && (
        <button className="button" onClick={() => location.reload()}>
          {t('Try again')}
        </button>
      )}
    </div>
  )
}
