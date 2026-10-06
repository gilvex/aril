import { useTranslation } from '@/shared/i18n/index.ts'
import { sessionRequestState } from '@/app/config/sessionRequestState.ts'
import { isDemoMode } from '@/shared/utils/isDemoMode.ts'
import { rememberWorkspaceVisit } from '@/shared/utils/rememberWorkspaceVisit.ts'
import { createAppState } from '@/app/model/createAppState.ts'
import { useAppModel } from '@/app/model/useAppModel.ts'
import { startSession } from '@/app/utils/startSession.ts'
import { draftKey, scopedDraftKey } from '@/entities/workspace/index.ts'
import { ApiError } from '@/shared/api/apiError.ts'
import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import { sessionTokenKey } from '@/shared/config/sessionTokenKey.ts'
import { saveStudioRoute } from '@/shared/utils/saveStudioRoute.ts'
import { isFreshDraft } from '@pomegranate/domain/freshness'
import type { StudioSummary } from '@pomegranate/domain/studios'
import type { Envelope } from '@pomegranate/domain/workspace'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import { useEffect } from 'react'
export function useAppController() {
  const { t } = useTranslation()
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
    googleLinked,
    setGoogleLinked,
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
    if (!profile?.guestExpiresAt) return
    let cancelled = false
    const ended = () => {
      if (cancelled) return
      setProfile(null)
      setInviteRequired(true)
      setError(
        t(
          'Your guest access has ended. Ask for a new guest link or sign in with Google.',
        ),
      )
    }
    const expire = () => {
      if (Date.now() >= profile.guestExpiresAt!) ended()
    }
    const expiry = setTimeout(
      expire,
      Math.min(2147483647, Math.max(0, profile.guestExpiresAt - Date.now())),
    )
    const check = setInterval(() => {
      expire()
      void request('/api/session').catch((error) => {
        if (error instanceof ApiError && error.status === 401) ended()
      })
    }, 10000)
    return () => {
      cancelled = true
      clearTimeout(expiry)
      clearInterval(check)
    }
  }, [profile?.guestExpiresAt, setProfile, setInviteRequired, setError, t])
  useEffect(() => {
    let cancelled = false
    ;(sessionRequestState.value ??= startSession())
      .then((result) => {
        if (result.token) localStorage.setItem(sessionTokenKey, result.token)
        if (!cancelled) {
          setGoogleLinked(!!result.googleLinked)
          setInviteRequired(!!result.inviteRequired)
          setProfile(result.profile)
        }
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
  }, [setError, setInviteRequired, setProfile, setGoogleLinked])
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
  }, [
    token,
    startupRoute.workspaceId,
    profile,
    setStudio,
    setRestoringRoute,
    setRouteNotice,
    setError,
  ])
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
          const old =
            !isDemoMode() && localStorage.getItem('pomegranate-studio-draft-v1')
          if (old && !raw)
            setLegacy(workspaceSchema.parse(JSON.parse(old).workspace))
        } catch {
          /* Malformed recovery data never replaces the server document. */
        }
        setInitial(result)
        rememberWorkspaceVisit(profile.id, studio.id)
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
  }, [
    profile,
    setError,
    setInitial,
    setLegacy,
    setRecovery,
    setRouteNotice,
    setStaleDraftKey,
    setStudio,
    studio,
  ])
  return {
    legacy,
    staleDraftKey,
    setStaleDraftKey,
    setRecovery,
    setInitial,
    setLegacy,
    studio,
    setError,
    profile,
    token,
    restoringRoute,
    initial,
    googleLinked,
    setGoogleLinked,
    inviteRequired,
    setBusy,
    name,
    setProfile,
    setInviteRequired,
    setToken,
    setName,
    busy,
    error,
    routeNotice,
    setRouteNotice,
    setStudio,
    recovery,
  }
}
