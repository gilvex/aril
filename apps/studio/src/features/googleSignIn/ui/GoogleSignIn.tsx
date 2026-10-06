import type { Profile } from '@pomegranate/domain/collaboration'
import { useEffect, useRef } from 'react'
import { request } from '../../../shared/api/request.ts'
import { sessionTokenKey } from '../../../shared/config/sessionTokenKey.ts'
import { createGoogleSignInState } from '../model/createGoogleSignInState.ts'
import { useGoogleSignInModel } from '../model/useGoogleSignInModel.ts'
import type { GoogleSignInProps } from '../types/googleSignInProps.ts'
import { loadGoogle } from '../utils/loadGoogle.ts'
export function GoogleSignIn({ link = false, onSuccess }: GoogleSignInProps) {
  const root = useRef<HTMLDivElement>(null)
  const callback = useRef(onSuccess)
  useEffect(() => {
    callback.current = onSuccess
  }, [onSuccess])
  const { error, setError, status, setStatus, retry, setRetry } =
    useGoogleSignInModel(() => createGoogleSignInState())

  useEffect(() => {
    let active = true
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
              setError(err instanceof Error ? err.message : 'Sign-in failed.')
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
  }, [link, retry])
  return (
    <div className="google-signin">
      <p>{status}</p>
      <div ref={root} />
      {error && (
        <>
          <p className="form-error" role="alert">
            {error}
          </p>
          <button
            type="button"
            className="button"
            onClick={() => {
              setError('')
              setRetry((value) => value + 1)
            }}
          >
            Try Google again
          </button>
        </>
      )}
    </div>
  )
}
