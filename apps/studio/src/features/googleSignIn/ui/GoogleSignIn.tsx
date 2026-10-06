import { Spinner } from '@/shared/ui/index.tsx'
import { useTranslation } from '@/shared/i18n/index.ts'
import { useGoogleSignInHandlers } from '../model/useGoogleSignInHandlers.tsx'

import { createGoogleSignInState } from '@/features/googleSignIn/model/createGoogleSignInState.ts'
import { useGoogleSignInModel } from '@/features/googleSignIn/model/useGoogleSignInModel.ts'
import type { GoogleSignInProps } from '@/features/googleSignIn/types/googleSignInProps.ts'
import { loadGoogle } from '@/features/googleSignIn/utils/loadGoogle.ts'
import { request } from '@/shared/api/request.ts'
import { sessionTokenKey } from '@/shared/config/sessionTokenKey.ts'
import type { Profile } from '@pomegranate/domain/collaboration'
import { useEffect, useRef } from 'react'

export function GoogleSignIn({ link = false, onSuccess }: GoogleSignInProps) {
  const { t } = useTranslation()

  const root = useRef<HTMLDivElement>(null)
  const callback = useRef(onSuccess)
  useEffect(() => {
    callback.current = onSuccess
  }, [onSuccess])
  const { error, setError, status, setStatus, retry, setRetry } =
    useGoogleSignInModel(() => createGoogleSignInState())

  useEffect(() => {
    let active = true
    setStatus('Loading Google sign-in…')
    const mount = async () => {
      const config = await request<{ googleClientId: string | null }>(
        '/api/auth/config',
      )
      if (!active) return
      if (!config.googleClientId) {
        setStatus(
          link
            ? 'Google sign-in is awaiting setup by the studio host. Your current invitation access still works.'
            : 'Google sign-in is not enabled yet. Use an invitation to join.',
        )
        return
      }
      const challenge = await request<{ challenge: string; nonce: string }>(
        '/api/auth/google/challenge',
        { method: 'POST', headers: { 'x-pomegranate-auth': '1' } },
      )
      await loadGoogle()
      if (!active || !root.current) return
      window.google!.accounts.id.initialize({
        client_id: config.googleClientId,
        nonce: challenge.nonce,
        auto_select: false,
        callback: async ({ credential }) => {
          if (!active) return
          try {
            setStatus('Verifying your Google account…')
            const result = await request<{ profile: Profile; token?: string }>(
              '/api/auth/google',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-pomegranate-auth': '1',
                },
                body: JSON.stringify({
                  credential,
                  challenge: challenge.challenge,
                  link,
                }),
              },
            )
            if (!active) return
            if (result.token)
              localStorage.setItem(sessionTokenKey, result.token)
            setStatus(
              link
                ? 'Google connected. Your workspaces will be here when you sign in again.'
                : 'Signed in.',
            )
            callback.current(result.profile)
          } catch (err) {
            if (active) {
              setStatus('')
              setError(
                err instanceof Error ? err.message : t('Sign-in failed.'),
              )
            }
          }
        },
      })
      root.current.replaceChildren()
      window.google!.accounts.id.renderButton(root.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
      })
      setStatus(
        link
          ? 'Connect Google to keep access across browsers and devices.'
          : 'Already connected your Google account? Sign in to your workspaces.',
      )
    }
    void mount().catch((err) => {
      if (active) {
        setStatus('')
        setError(String(err))
      }
    })
    return () => {
      active = false
    }
  }, [link, retry, setError, setStatus, t])

  const { handleClick } = useGoogleSignInHandlers({ setError, setRetry })
  return (
    <div className="google-signin">
      <p role="status">
        {!error &&
          (status === 'Loading Google sign-in…' ||
            status === 'Verifying your Google account…') && <Spinner />}{' '}
        {t(status)}
      </p>
      <div ref={root} />
      {error && (
        <>
          <p className="form-error" role="alert">
            {error}
          </p>
          <button type="button" className="button" onClick={handleClick}>
            {t('Try Google again')}
          </button>
        </>
      )}
    </div>
  )
}
