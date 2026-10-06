import { saveStudioRoute } from '@/shared/utils/saveStudioRoute.ts'
import { useCallback } from 'react'

import type { AppHandlersProps } from '../types/useAppHandlersProps.ts'
export function useAppHandlers({
  setInitial,
  setRecovery,
  setError,
  setRouteNotice,
  setStudio,
  setProfile,
}: AppHandlersProps) {
  const openWorkspace = useCallback<
    (value: import('@pomegranate/domain/studios').StudioSummary) => void
  >(
    (value) => {
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
    },
    [setInitial, setRecovery, setError, setRouteNotice, setStudio],
  )
  const returnToWorkspaces = useCallback<
    (value: import('@pomegranate/domain/collaboration').Profile) => void
  >(
    (value) => {
      saveStudioRoute(null)
      setProfile(value)
      setInitial(null)
      setRecovery(undefined)
      setStudio(null)
    },
    [setProfile, setInitial, setRecovery, setStudio],
  )
  return { openWorkspace, returnToWorkspaces }
}
