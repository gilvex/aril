import { AccountActions } from '@/features/accountActions/index.ts'
import { useCallback } from 'react'
import { GoogleSignIn } from '@/features/googleSignIn/index.ts'
import { LoadingStatus } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useJoinStudioScreenHandlers } from '../model/useJoinStudioScreenHandlers.tsx'
import type { LoginAuthProps } from '../types/loginAuthProps.ts'
import { LoginInvitation } from './LoginInvitation.tsx'
import { DemoEntry } from './DemoEntry.tsx'

export function LoginAuth(props: LoginAuthProps) {
  const Heading = props.heading || 'h1'
  const { t } = useTranslation()
  const { inviteRequired, token, profile, error, googleLinked } = props
  const { handleSuccess } = useJoinStudioScreenHandlers()
  const retry = useCallback(() => location.reload(), [])
  const joining = inviteRequired || !!token
  const switching =
    new URLSearchParams(location.search).get('account') === 'switch'
  return (
    <section className="login-auth" aria-labelledby="login-title">
      <Heading id="login-title">
        {t(
          profile && joining
            ? 'Join your team’s studio'
            : switching
              ? 'Choose another account'
              : 'Sign in to Aril',
        )}
      </Heading>
      <p className="login-description">
        {t(
          profile && googleLinked && joining
            ? 'Accept your invitation to add this workspace to your account.'
            : 'Sign in with Google, then use your invitation code to join a workspace.',
        )}
      </p>
      {joining && (!profile || !googleLinked) && (
        <GoogleSignIn link={!!profile} onSuccess={handleSuccess} />
      )}
      {joining && profile && googleLinked ? (
        <>
          <p className="login-help">
            {t('Signed in as {{name}}', { name: profile.name })}
          </p>
          <LoginInvitation {...props} />
        </>
      ) : !joining && !error ? (
        <LoadingStatus label={t('Opening your shared workspace…')} />
      ) : null}
      {joining && (
        <p className="login-help">
          {t('Ask a workspace member for an invitation.')}
        </p>
      )}
      {profile && joining && <AccountActions />}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {error && !joining && (
        <button className="button" onClick={retry}>
          {t('Try again')}
        </button>
      )}
      {!profile && <DemoEntry />}
    </section>
  )
}
