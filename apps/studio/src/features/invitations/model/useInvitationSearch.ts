import { useEffect } from 'react'
import type { InvitationUser } from '@aril/domain/invitations'
import { request } from '@/shared/api/request.ts'
import type { InvitationState } from '../types/index.ts'
export function useInvitationSearch(
  workspaceId: string,
  value: string,
  selected: InvitationUser | null,
  set: (value: Partial<InvitationState>) => void,
) {
  useEffect(() => {
    if (selected || value.trim().length < 3) {
      set({ users: [] })
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(() => {
      request<InvitationUser[]>(
        '/api/directory?q=' + encodeURIComponent(value.trim()),
        {
          headers: { 'x-workspace-id': workspaceId },
          signal: controller.signal,
        },
      )
        .then((users) => {
          if (!controller.signal.aborted) set({ users })
        })
        .catch(() => {
          if (!controller.signal.aborted) set({ users: [] })
        })
    }, 250)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [workspaceId, value, selected, set])
}
