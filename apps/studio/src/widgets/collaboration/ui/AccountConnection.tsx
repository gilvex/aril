import { useEffect } from 'react'
import { GoogleSignIn } from '../../../features/googleSignIn/index.ts'
import { request } from '../../../shared/api/request.ts'
import { createAccountConnectionState } from '../model/createAccountConnectionState.ts'
import { useAccountConnectionModel } from '../model/useAccountConnectionModel.ts'
import type { AccountConnectionProps } from '../types/accountConnectionProps.ts'

export function AccountConnection({ onProfile }: AccountConnectionProps) {
  const { account, setAccount, error, setError } = useAccountConnectionModel(
    () => createAccountConnectionState(),
  )

  const refresh = () =>
    request<{ google: { email: string } | null }>('/api/account')
      .then(setAccount)
      .catch((err) => setError(String(err)))
  useEffect(() => {
    void refresh()
  }, [])
  return (
    <section className="account-connection">
      <strong>Keep your access</strong>
      {error && <p className="form-error">{error}</p>}
      {account?.google ? (
        <p>
          Connected to Google as <b>{account.google.email}</b>. Sign in with
          this account to open your workspaces on another device.
        </p>
      ) : account ? (
        <GoogleSignIn
          link
          onSuccess={(profile) => {
            onProfile(profile)
            void refresh()
          }}
        />
      ) : (
        <p>Loading account…</p>
      )}
    </section>
  )
}
