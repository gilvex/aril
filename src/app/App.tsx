import { useEffect, useState } from 'react'
import { Studio, draftKey } from '../pages/studio'
import {
  ApiError,
  downloadJson,
  request,
  workspaceSchema,
  sessionTokenKey,
  workspaceHeaders,
  type Envelope,
  type Workspace,
} from '../shared/api/workspace'
import type { Profile } from '../../domain/collaboration'
import type { Recovery } from '../pages/studio/model/use-workspace'
import { scopedDraftKey } from '../pages/studio/model/use-workspace'
import { WorkspaceHome } from './WorkspaceHome'
import type { StudioSummary } from '../../domain/studios'
import { GoogleSignIn } from '../shared/ui/GoogleSignIn'
let sessionRequest: Promise<{ profile: Profile; token?: string }> | undefined

export function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [studio, setStudio] = useState<StudioSummary | null>(null)
  const [initial, setInitial] = useState<Envelope | null>(null)
  const [recovery, setRecovery] = useState<Recovery>()
  const [legacy, setLegacy] = useState<Workspace | null>(null)
  const [inviteRequired, setInviteRequired] = useState(false)
  const [token, setToken] = useState(
    () => new URLSearchParams(location.hash.slice(1)).get('invite') || '',
  )
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    ;(sessionRequest ??= request<{ profile: Profile; token?: string }>(
      '/api/session',
    ))
      .then((result) => {
        if (result.token) localStorage.setItem(sessionTokenKey, result.token)
        if (!cancelled) setProfile(result.profile)
      })
      .catch((err) => {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401)
          setInviteRequired(true)
        else setError(String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])
  useEffect(() => {
    if (!profile || !studio) return
    let cancelled = false
    request<Envelope>('/api/workspace', {
      headers: workspaceHeaders(studio.id),
    })
      .then((result) => {
        if (cancelled) return
        try {
          const key = scopedDraftKey(studio.id, profile.id)
          const raw =
            sessionStorage.getItem(key) ||
            (studio.id === 'default' ? sessionStorage.getItem(draftKey) : null)
          if (raw) {
            const draft = JSON.parse(raw)
            if (
              Number.isSafeInteger(draft.base?.revision) &&
              draft.base.revision > 0
            )
              setRecovery({
                base: {
                  ...draft.base,
                  workspace: workspaceSchema.parse(draft.base.workspace),
                },
                workspace: workspaceSchema.parse(draft.workspace),
              })
            sessionStorage.setItem(key, raw)
            if (studio.id === 'default') sessionStorage.removeItem(draftKey)
          }
          const old = localStorage.getItem('pomegranate-studio-draft-v1')
          if (old) setLegacy(workspaceSchema.parse(JSON.parse(old).workspace))
        } catch {
          /* Malformed recovery data never replaces the server document. */
        }
        setInitial(result)
      })
      .catch((err) => {
        if (!cancelled) setError(String(err))
      })
    return () => {
      cancelled = true
    }
  }, [profile?.id, studio?.id])
  if (legacy)
    return (
      <div className="boot-screen">
        <img src="/mark.svg" alt="" />
        <h1>You have an older recovery draft.</h1>
        <p>
          Your saved workspace is safe. Keep a copy of these unsaved edits
          before opening the shared studio.
        </p>
        <textarea
          className="legacy-json"
          aria-label="Recovery draft JSON"
          readOnly
          value={JSON.stringify(legacy, null, 2)}
          onFocus={(event) => event.target.select()}
        />
        <div className="modal-actions">
          <button
            className="button"
            onClick={() => downloadJson(legacy, 'pomegranate-recovery.json')}
          >
            Download draft
          </button>
          <button
            className="button primary"
            onClick={() => {
              localStorage.removeItem('pomegranate-studio-draft-v1')
              setLegacy(null)
            }}
          >
            Continue with saved workspace
          </button>
        </div>
      </div>
    )
  if (!profile || token || (studio && !initial))
    return (
      <div className="boot-screen">
        <img src="/mark.svg" alt="" />
        <h1>
          {inviteRequired || token
            ? 'Good ideas are better together.'
            : 'A little space for big ideas.'}
        </h1>
        {inviteRequired || token ? (
          <form
            className="join-form"
            onSubmit={async (event) => {
              event.preventDefault()
              setBusy(true)
              setError('')
              try {
                const result = await request<{
                  profile: Profile
                  token: string
                }>('/api/join', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    token: token.trim(),
                    name: profile?.name || name,
                  }),
                })
                if (result.token)
                  localStorage.setItem(sessionTokenKey, result.token)
                history.replaceState(
                  null,
                  '',
                  location.pathname + location.search,
                )
                setProfile(result.profile)
                setInviteRequired(false)
                setToken('')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not join.')
              } finally {
                setBusy(false)
              }
            }}
          >
            <p>
              Join Pomegranate with an invitation from someone in the studio.
            </p>
            {!profile && (
              <label>
                Your name
                <input
                  autoComplete="nickname"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={60}
                />
              </label>
            )}
            <label>
              Invite code
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
                autoComplete="off"
              />
            </label>
            <button
              className="button primary"
              disabled={busy || (!profile && !name.trim()) || !token.trim()}
            >
              {busy
                ? 'Joining…'
                : profile
                  ? `Accept invitation as ${profile.name}`
                  : 'Join studio'}
            </button>
          </form>
        ) : (
          <p>{error || 'Opening your shared workspace…'}</p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {!profile && inviteRequired && (
          <GoogleSignIn
            onSuccess={(value) => {
              setProfile(value)
              setInviteRequired(false)
              setError('')
            }}
          />
        )}
        {error && !inviteRequired && (
          <button className="button" onClick={() => location.reload()}>
            Try again
          </button>
        )}
      </div>
    )
  if (!studio || !initial)
    return (
      <WorkspaceHome
        profile={profile}
        onOpen={(value) => {
          setInitial(null)
          setRecovery(undefined)
          setError('')
          setStudio(value)
        }}
      />
    )
  return (
    <Studio
      key={studio.id}
      studio={studio}
      initial={initial}
      recovery={recovery}
      initialProfile={profile}
      onWorkspaces={(value) => {
        setProfile(value)
        setInitial(null)
        setRecovery(undefined)
        setStudio(null)
      }}
    />
  )
}
