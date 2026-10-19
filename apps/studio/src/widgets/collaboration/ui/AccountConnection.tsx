import { guestLinkNoExpiry } from '@aril/domain/collaboration'
import type { LinkedAccount } from '@aril/domain/accounts'
import { FederatedSignIn } from '@/features/federatedSignIn/index.ts'
import { LoadingStatus } from '@/shared/ui/index.tsx'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useAccountConnectionHandlers } from '../model/useAccountConnectionHandlers.tsx'

import { GoogleSignIn } from '@/features/googleSignIn/index.ts'
import { request } from '@/shared/api/request.ts'
import { createAccountConnectionState } from '@/widgets/collaboration/model/createAccountConnectionState.ts'
import { useAccountConnectionModel } from '@/widgets/collaboration/model/useAccountConnectionModel.ts'
import type { AccountConnectionProps } from '@/widgets/collaboration/types/accountConnectionProps.ts'
import { useCallback, useEffect } from 'react'

export function AccountConnection({ onProfile }: AccountConnectionProps) {
  const { t, i18n } = useTranslation()

  const { account, setAccount, error, setError } = useAccountConnectionModel(
    () => createAccountConnectionState(),
  )

  const refresh = useCallback(
    () =>
      request<{
        guestExpiresAt?: number | null
        google: { email: string } | null
        accounts?: LinkedAccount[]
      }>('/api/account')
        .then(setAccount)
        .catch((err) => setError(String(err))),
    [setAccount, setError],
  )
  useEffect(() => {
    void refresh()
  }, [refresh])

  const { handleSuccess } = useAccountConnectionHandlers({ onProfile, refresh })
  const linkedAccounts = account?.accounts?.length
    ? account.accounts
    : account?.google
      ? [
          {
            provider: 'google',
            issuer: 'https://accounts.google.com',
            email: account.google.email,
          },
        ]
      : []
  if (isDemoMode())
    return (
      <p className="collaboration-hint">
        {t(
          'This is a local demo. Sign in outside the demo to connect an account or invite real teammates.',
        )}
      </p>
    )
  if (account?.guestExpiresAt)
    return (
      <p className="collaboration-hint">
        {account.guestExpiresAt === guestLinkNoExpiry
          ? t('Guest access lasts until the link is revoked.')
          : t('Guest access expires {{time}}', {
              time: new Date(account.guestExpiresAt).toLocaleString(
                i18n.language,
              ),
            })}
      </p>
    )
  return (
    <section className="account-connection">
      <strong>
        {t(linkedAccounts.length ? 'Account access' : 'Keep your access')}
      </strong>
      {error && <p className="form-error">{error}</p>}
      {linkedAccounts.map((item) => (
        <p key={item.provider + item.issuer}>
          {t('Connected to {{provider}}', {
            provider:
              item.provider === 'google'
                ? 'Google'
                : item.provider === 'yandex'
                  ? t('Yandex ID')
                  : 'SSO',
          })}{' '}
          <b>{item.email || item.issuer}</b>
        </p>
      ))}
      {linkedAccounts.length ? (
        <p>
          {t(
            'Sign in with a connected account to open your workspaces on another device.',
          )}
        </p>
      ) : account ? (
        <>
          <GoogleSignIn link onSuccess={handleSuccess} />
          <FederatedSignIn provider="yandex" link />
          <FederatedSignIn provider="oidc" link />
        </>
      ) : !error ? (
        <LoadingStatus label={t('Loading accountâ€¦')} />
      ) : null}
    </section>
  )
}
