import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import type { Envelope } from '@pomegranate/domain/workspace'
import { useCallback } from 'react'

import type { StaleDraftScreenHandlersProps } from '../types/useStaleDraftScreenHandlersProps.ts'
export function useStaleDraftScreenHandlers({
  staleDraftKey,
  setStaleDraftKey,
  setRecovery,
  setInitial,
  setLegacy,
  studio,
  setError,
}: StaleDraftScreenHandlersProps) {
  const handleClick = useCallback<() => void>(() => {
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
  }, [
    staleDraftKey,
    setStaleDraftKey,
    setRecovery,
    setInitial,
    setLegacy,
    studio,
    setError,
  ])
  return { handleClick }
}
