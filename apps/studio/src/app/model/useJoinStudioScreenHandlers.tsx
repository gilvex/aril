import { useCallback } from 'react'

import type { JoinStudioScreenHandlersProps } from '../types/useJoinStudioScreenHandlersProps.ts'
export function useJoinStudioScreenHandlers({
  setProfile,
  setInviteRequired,
  setError,
}: JoinStudioScreenHandlersProps) {
  const handleSuccess = useCallback<
    (value: import('@pomegranate/domain/collaboration').Profile) => void
  >(
    (value) => {
      setProfile(value)
      setInviteRequired(false)
      setError('')
    },
    [setProfile, setInviteRequired, setError],
  )
  return { handleSuccess }
}
