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
  const { t } = useTranslation()

  const { account, setAccount, error, setError } = useAccountConnectionModel(
    () => createAccountConnectionState(),
  )

  const refresh = useCallback(
    () =>
      request<{ google: { email: string } | null }>('/api/account')
        .then(setAccount)
        .catch((err) => setError(String(err))),
    [setAccount, setError],
  )
  useEffect(() => {
    void refresh()
  }, [refresh])

  const { handleSuccess } = useAccountConnectionHandlers({ onProfile, refresh })
  if (isDemoMode())
    return (
      <p className="collaboration-hint">
        {t(
          'This is a local demo. Sign in outside the demo to connect an account or invite real teammates.',
        )}
      </p>
    )
  return (
    <section className="account-connection">
      <strong>{t('Keep your access')}</strong>
      {error && <p className="form-error">{error}</p>}
      {account?.google ? (
        <p>
          {t('Connected to Google as')} <b>{account.google.email}</b>
          {t(
            '. Sign in with this account to open your workspaces on another device.',
          )}
        </p>
      ) : account ? (
        <GoogleSignIn link onSuccess={handleSuccess} />
      ) : !error ? (
        <LoadingStatus label={t('Loading account…')} />
      ) : null}
    </section>
  )
}
