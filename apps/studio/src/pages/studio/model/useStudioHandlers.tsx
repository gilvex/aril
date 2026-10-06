import { useCallback } from 'react'

import type { StudioHandlersProps } from '../types/useStudioHandlersProps.ts'
export function useStudioHandlers({
  followId,
  setFollowId,
}: StudioHandlersProps) {
  const handlePointerDownCapture = useCallback<
    (event: import('react').PointerEvent<HTMLDivElement>) => void
  >(
    (event) => {
      if (
        followId &&
        !(event.target as Element).closest('[data-follow-controls]')
      )
        setFollowId(null)
    },
    [followId, setFollowId],
  )
  const handleKeyDownCapture = useCallback<
    (event: import('react').KeyboardEvent<HTMLDivElement>) => void
  >(
    (event) => {
      if (
        followId &&
        !['Tab', 'Shift', 'Control', 'Meta', 'Alt'].includes(event.key)
      )
        setFollowId(null)
    },
    [followId, setFollowId],
  )
  return { handlePointerDownCapture, handleKeyDownCapture }
}
