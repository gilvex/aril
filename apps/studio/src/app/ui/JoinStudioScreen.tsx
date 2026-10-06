import { useCallback } from 'react'
import { InstallApp } from '@/features/installApp/index.ts'
import { GoogleSignIn } from '@/features/googleSignIn/index.ts'
import { LoadingStatus } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useJoinStudioScreenHandlers } from '../model/useJoinStudioScreenHandlers.tsx'
import type { JoinStudioScreenProps } from '../types/joinStudioScreenProps.ts'
import { LoginHeader } from './LoginHeader.tsx'
import { LoginBlueprint } from './LoginBlueprint.tsx'
import { LoginInvitation } from './LoginInvitation.tsx'
import './loginScreen.css'

export function JoinStudioScreen(props: JoinStudioScreenProps) {
  const { t } = useTranslation()
  const { inviteRequired, token, profile, error } = props
  const { handleSuccess } = useJoinStudioScreenHandlers(props)
  const retry = useCallback(() => location.reload(), [])
  const joining = inviteRequired || !!token
  const switching =
    new URLSearchParams(location.search).get('account') === 'switch'
  return (
    <div className="login-screen">
      <LoginHeader />
      <main className="login-layout">
        <section className="login-auth" aria-labelledby="login-title">
          <h1 id="login-title">
            {t(
              profile && token
                ? 'Join your team’s studio'
                : switching
                  ? 'Choose another account'
                  : 'Sign in to Aril',
            )}
          </h1>
          <p className="login-description">
            {t(
              profile && token
                ? 'Accept your invitation to add this workspace to your account.'
                : 'Continue with your linked Google account.',
            )}
          </p>
          {!profile && joining && <GoogleSignIn onSuccess={handleSuccess} />}
          {joining ? (
            <>
              {!profile && (
                <div className="login-divider">
                  <span>{t('or')}</span>
                </div>
              )}
              <LoginInvitation {...props} />
              <p className="login-help">
                {t('Ask a workspace member for an invitation.')}
              </p>
            </>
          ) : !error ? (
            <LoadingStatus label={t('Opening your shared workspace…')} />
          ) : null}
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
        </section>
        <LoginBlueprint />
      </main>
      <footer className="login-footer">
        <InstallApp />
      </footer>
    </div>
  )
}
