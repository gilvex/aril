import { useCallback } from 'react'
import { request } from '@/shared/api/index.ts'
import { sessionTokenKey } from '@/shared/config/sessionTokenKey.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import { Spinner } from '@/shared/ui/index.tsx'
import type { JoinStudioScreenProps } from '../types/joinStudioScreenProps.ts'
import { LoginHeader } from './LoginHeader.tsx'
import { LoginBlueprint } from './LoginBlueprint.tsx'

export function GuestJoinScreen({
  token,
  name,
  setName,
  busy,
  setBusy,
  error,
  setError,
}: JoinStudioScreenProps) {
  const { t } = useTranslation()
  const join = useCallback(
    async (event: React.SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      setBusy(true)
      setError('')
      try {
        const result = await request<{ token: string; workspaceId: string }>(
          '/api/auth/guest',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-pomegranate-auth': '1',
            },
            body: JSON.stringify({ token: token.slice(6), name }),
          },
        )
        localStorage.setItem(sessionTokenKey, result.token)
        location.replace(
          `/?workspace=${encodeURIComponent(result.workspaceId)}&view=canvas`,
        )
      } catch (err) {
        setError(t(err instanceof Error ? err.message : 'Could not join.'))
        setBusy(false)
      }
    },
    [token, name, setBusy, setError, t],
  )
  const changeName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value),
    [setName],
  )
  return (
    <div className="login-screen">
      <LoginHeader />
      <main className="login-layout">
        <section className="login-auth">
          <h1>{t('Join as a guest')}</h1>
          <p className="login-description">
            {t(
              'No Google account needed. Your access ends when this link expires or is revoked.',
            )}
          </p>
          <form className="join-form" onSubmit={join}>
            <label>
              {t('Your name')}
              <input
                value={name}
                onChange={changeName}
                required
                maxLength={60}
                autoComplete="nickname"
                autoFocus
              />
            </label>
            <p className="login-help">
              {t(
                'This opens a temporary guest profile in this browser. Your existing account is kept.',
              )}
            </p>
            <button className="button primary" disabled={busy || !name.trim()}>
              {busy && <Spinner />}
              {t('Enter workspace')}
            </button>
          </form>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <a className="login-help" href="/">
            {t('Sign in with Google instead')}
          </a>
        </section>
        <LoginBlueprint />
      </main>
    </div>
  )
}
