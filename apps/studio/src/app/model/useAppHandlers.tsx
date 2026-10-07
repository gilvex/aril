import { saveStudioRoute } from '@/shared/utils/saveStudioRoute.ts'
import { readStudioRoute } from '@/shared/utils/readStudioRoute.ts'
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
      let previous = null
      try {
        previous = readStudioRoute(
          sessionStorage.getItem(`aril:workspaceRoute:${value.id}`) || '',
        )
      } catch {
        /* Open the default view. */
      }
      saveStudioRoute(
        previous?.workspaceId === value.id
          ? previous
          : {
              workspaceId: value.id,
              view: 'canvas',
              canvasMode: 'canvas',
            },
      )
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
