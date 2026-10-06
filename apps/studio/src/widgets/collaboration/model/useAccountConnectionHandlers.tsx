import { useCallback } from 'react'

import type { AccountConnectionHandlersProps } from '../types/useAccountConnectionHandlersProps.ts'
export function useAccountConnectionHandlers({
  onProfile,
  refresh,
}: AccountConnectionHandlersProps) {
  const handleSuccess = useCallback<
    (profile: import('@pomegranate/domain/collaboration').Profile) => void
  >(
    (profile) => {
      onProfile(profile)
      void refresh()
    },
    [onProfile, refresh],
  )
  return { handleSuccess }
}
