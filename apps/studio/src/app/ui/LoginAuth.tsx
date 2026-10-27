import { Text } from '@/shared/ui/Text.tsx'
import {
  getProductBranding,
  isProductSiteEnabled,
} from '@/shared/deploymentSettings/index.ts'
import { FederatedSignIn } from '@/features/federatedSignIn/index.ts'
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
  const { inviteRequired, token, profile, error, accountLinked } = props
  const { handleSuccess, openWorkspaces } = useJoinStudioScreenHandlers(props)
  const retry = useCallback(() => location.reload(), [])
  const joining = inviteRequired || !!token
  const switching =
    new URLSearchParams(location.search).get('account') === 'switch'
  return (
    <section className="login-auth" aria-labelledby="login-title">
      <Heading id="login-title">
        <Text>
          {t(
            profile && joining
              ? 'Join your team’s studio'
              : switching
                ? 'Choose another account'
                : 'Sign in to {{product}}',
            { product: getProductBranding().productName },
          )}
        </Text>
      </Heading>
      <Text as="p" className="login-description">
        {t(
          profile && accountLinked && joining
            ? 'Accept your invitation to add this workspace to your account.'
            : 'Sign in to create your own workspace or join a team with an invitation.',
        )}
      </Text>
      {joining && (!profile || !accountLinked) && (
        <>
          <GoogleSignIn link={!!profile} onSuccess={handleSuccess} />
          <FederatedSignIn provider="yandex" link={!!profile} />
          <FederatedSignIn provider="oidc" link={!!profile} />
        </>
      )}
      {joining && profile && accountLinked ? (
        <>
          <Text as="p" className="login-help">
            {t('Signed in as {{name}}', { name: profile.name })}
          </Text>
          <LoginInvitation {...props} />
          <button className="button" onClick={openWorkspaces}>
            <Text>{t('Go to my workspaces')}</Text>
          </button>
        </>
      ) : !joining && !error ? (
        <LoadingStatus label={t('Opening your shared workspace…')} />
      ) : null}
      {joining && (
        <Text as="p" className="login-help">
          {t('An invitation is only needed to join someone else’s workspace.')}
        </Text>
      )}
      {profile && joining && <AccountActions />}
      {error && (
        <Text as="p" className="form-error" role="alert">
          {error}
        </Text>
      )}
      {error && !joining && (
        <button className="button" onClick={retry}>
          <Text>{t('Try again')}</Text>
        </button>
      )}
      {!profile && isProductSiteEnabled() && <DemoEntry />}
    </section>
  )
}
