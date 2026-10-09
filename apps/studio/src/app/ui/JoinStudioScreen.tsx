import { GuestJoinScreen } from './GuestJoinScreen.tsx'
import { AccountActions } from '@/features/accountActions/index.ts'
import { useCallback } from 'react'
import { InstallApp } from '@/features/installApp/index.ts'
import { GoogleSignIn } from '@/features/googleSignIn/index.ts'
import { LoadingStatus, ProjectLinks } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useJoinStudioScreenHandlers } from '../model/useJoinStudioScreenHandlers.tsx'
import type { JoinStudioScreenProps } from '../types/joinStudioScreenProps.ts'
import { LoginHeader } from './LoginHeader.tsx'
import { LoginBlueprint } from './LoginBlueprint.tsx'
import { LoginInvitation } from './LoginInvitation.tsx'
import { DemoEntry } from './DemoEntry.tsx'
import './loginScreen.css'

export function JoinStudioScreen(props: JoinStudioScreenProps) {
  const { t } = useTranslation()
  const { inviteRequired, token, profile, error, googleLinked } = props
  const { handleSuccess } = useJoinStudioScreenHandlers()
  const retry = useCallback(() => location.reload(), [])
  const joining = inviteRequired || !!token
  const switching =
    new URLSearchParams(location.search).get('account') === 'switch'
  if (token.startsWith('guest:')) return <GuestJoinScreen {...props} />
  return (
    <div className="login-screen">
      <LoginHeader />
      <main className="login-layout">
        <section className="login-auth" aria-labelledby="login-title">
          <h1 id="login-title">
            {t(
              profile && joining
                ? 'Join your team’s studio'
                : switching
                  ? 'Choose another account'
                  : 'Sign in to Aril',
            )}
          </h1>
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
        <LoginBlueprint />
      </main>
      <footer className="login-footer">
        <ProjectLinks />
        <InstallApp />
      </footer>
    </div>
  )
}
