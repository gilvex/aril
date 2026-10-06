import type { Profile } from '@pomegranate/domain/collaboration'
import { isFreshDraft } from '@pomegranate/domain/freshness'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { Envelope } from '@pomegranate/domain/workspace'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import { useEffect } from 'react'
import { draftKey, scopedDraftKey } from '../../entities/workspace/index.ts'
import { GoogleSignIn } from '../../features/googleSignIn/index.ts'
import { Studio } from '../../pages/studio/index.ts'
import { WorkspaceHome } from '../../pages/workspaces/index.ts'
import { ApiError } from '../../shared/api/apiError.ts'
import { downloadJson } from '../../shared/api/downloadJson.ts'
import { request } from '../../shared/api/request.ts'
import { workspaceHeaders } from '../../shared/api/workspaceHeaders.ts'
import { sessionTokenKey } from '../../shared/config/sessionTokenKey.ts'
import { saveStudioRoute } from '../../shared/utils/saveStudioRoute.ts'
import { sessionRequestState } from '../config/sessionRequestState.ts'
import { createAppState } from '../model/createAppState.ts'
import { useAppModel } from '../model/useAppModel.ts'
import { startSession } from '../utils/startSession.ts'
export function App() {
  const {
    startupRoute,
    restoringRoute,
    setRestoringRoute,
    routeNotice,
    setRouteNotice,
    profile,
    setProfile,
    studio,
    setStudio,
    initial,
    setInitial,
    recovery,
    setRecovery,
    legacy,
    setLegacy,
    staleDraftKey,
    setStaleDraftKey,
    inviteRequired,
    setInviteRequired,
    token,
    setToken,
    name,
    setName,
    busy,
    setBusy,
    error,
    setError,
  } = useAppModel(() => createAppState())

  useEffect(() => {
    let cancelled = false
    ;(sessionRequestState.value ??= startSession())
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
    if (!profile || token || !startupRoute.workspaceId) return
    let cancelled = false
    request<StudioSummary[]>('/api/studios')
      .then((studios) => {
        if (cancelled) return
        const saved = studios.find(
          (item) => item.id === startupRoute.workspaceId,
        )
        if (saved) setStudio(saved)
        else {
          saveStudioRoute(null)
          setRouteNotice(
            'That workspace is unavailable. Choose a workspace below.',
          )
        }
        setRestoringRoute(false)
      })
      .catch((err) => {
        if (!cancelled) setError(String(err))
      })
    return () => {
      cancelled = true
    }
  }, [profile?.id, token, startupRoute.workspaceId])
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
            ) {
              const parsed = {
                base: {
                  ...draft.base,
                  workspace: workspaceSchema.parse(draft.base.workspace),
                },
                workspace: workspaceSchema.parse(draft.workspace),
                writeVersion: draft.writeVersion,
              }
              if (isFreshDraft(parsed, result)) setRecovery(parsed)
              else {
                setLegacy(parsed.workspace)
                setStaleDraftKey(key)
                setRecovery(undefined)
              }
            }
            sessionStorage.setItem(key, raw)
            if (studio.id === 'default') sessionStorage.removeItem(draftKey)
          }
          const old = localStorage.getItem('pomegranate-studio-draft-v1')
          if (old && !raw)
            setLegacy(workspaceSchema.parse(JSON.parse(old).workspace))
        } catch {
          /* Malformed recovery data never replaces the server document. */
        }
        setInitial(result)
      })
      .catch((err) => {
        if (cancelled) return
        if (
          err instanceof ApiError &&
          (err.status === 403 || err.status === 404)
        ) {
          saveStudioRoute(null)
          setStudio(null)
          setInitial(null)
          setRouteNotice(
            'That workspace is unavailable. Choose a workspace below.',
          )
        } else setError(String(err))
      })
    return () => {
      cancelled = true
    }
  }, [profile?.id, studio?.id])
  if (legacy)
    return (
      <div className="boot-screen">
        <img src="/mark.svg" alt="" />
        <h1>This draft is out of date.</h1>
        <p>
          These edits came from an older page or saved revision and have not
          been applied. Download a copy if you need them, then open the latest
          shared workspace.
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
              if (staleDraftKey) sessionStorage.removeItem(staleDraftKey)
              setStaleDraftKey(null)
              setRecovery(undefined)
              setInitial(null)
              setLegacy(null)
              // Fetch again: collaborators may have edited while this notice was open.
              if (studio)
                void request<Envelope>('/api/workspace', {
                  headers: workspaceHeaders(studio.id),
                })
                  .then(setInitial)
                  .catch((err) => setError(String(err)))
            }}
          >
            Continue with saved workspace
          </button>
        </div>
      </div>
    )
  if (!profile || token || restoringRoute || (studio && !initial))
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
        notice={routeNotice}
        onOpen={(value) => {
          setInitial(null)
          setRecovery(undefined)
          setError('')
          setRouteNotice('')
          saveStudioRoute({
            workspaceId: value.id,
            view: 'canvas',
            canvasMode: 'canvas',
          })
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
        saveStudioRoute(null)
        setProfile(value)
        setInitial(null)
        setRecovery(undefined)
        setStudio(null)
      }}
    />
  )
}
