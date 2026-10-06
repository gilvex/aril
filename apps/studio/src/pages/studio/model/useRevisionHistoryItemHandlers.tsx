import { request } from '@/shared/api/request.ts'
import { workspaceHeaders } from '@/shared/api/workspaceHeaders.ts'
import { workspaceSchema } from '@pomegranate/domain/workspace'
import { useCallback } from 'react'

import type { RevisionHistoryItemHandlersProps } from '../types/useRevisionHistoryItemHandlersProps.ts'
export function useRevisionHistoryItemHandlers({
  s,
  studio,
  state,
  change,
  setModal,
  setNotice,
}: RevisionHistoryItemHandlersProps) {
  const handleClick = useCallback<() => Promise<void>>(async () => {
    try {
      const snapshot = workspaceSchema.parse(
        await request(`/api/history/${s.revision}`, {
          headers: workspaceHeaders(studio.id),
        }),
      )
      state.checkpoint()
      change(() => snapshot, false)
      setModal(null)
      setNotice(
        `Restored revision ${s.revision}. Your previous work is available with Undo.`,
      )
    } catch (e) {
      setNotice(String(e))
    }
  }, [s, studio, state, change, setModal, setNotice])
  return { handleClick }
}
