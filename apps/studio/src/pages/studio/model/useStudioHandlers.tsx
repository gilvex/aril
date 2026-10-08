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
        !(event.target as Element).closest('[data-follow-controls]') &&
        !(
          event.key === '/' &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          !(event.target as Element).closest(
            'input,textarea,select,[contenteditable="true"]',
          )
        ) &&
        !['Tab', 'Shift', 'Control', 'Meta', 'Alt'].includes(event.key)
      )
        setFollowId(null)
    },
    [followId, setFollowId],
  )
  const handleWheelCapture = useCallback<
    (event: import('react').WheelEvent<HTMLDivElement>) => void
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
  return { handlePointerDownCapture, handleKeyDownCapture, handleWheelCapture }
}
