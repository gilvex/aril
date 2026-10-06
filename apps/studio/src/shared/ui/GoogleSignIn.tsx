import { useEffect, useRef, useState } from 'react'
import { request, sessionTokenKey } from '../api/workspace'
import type { Profile } from '@pomegranate/domain/collaboration'

type GoogleApi = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string
        nonce: string
        callback: (response: { credential: string }) => void
        auto_select: boolean
      }) => void
      renderButton: (
        element: HTMLElement,
        options: { theme: string; size: string; text: string },
      ) => void
    }
  }
}
declare global {
  interface Window {
    google?: GoogleApi
  }
}
let scriptPromise: Promise<void> | undefined
function loadGoogle() {
  return (scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = undefined
      script.remove()
      reject(
        new Error(
          'Could not load Google sign-in. Check your connection and try again.',
        ),
      )
    }
    document.head.append(script)
  }))
}
export function GoogleSignIn({
  link = false,
  onSuccess,
}: {
  link?: boolean
  onSuccess: (profile: Profile) => void
}) {
  const root = useRef<HTMLDivElement>(null)
  const callback = useRef(onSuccess)
  useEffect(() => {
    callback.current = onSuccess
  }, [onSuccess])
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Loading Google sign-in…')
  const [retry, setRetry] = useState(0)
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
