import { useCallback } from 'react'

import type { FollowPersonHandlersProps } from '../types/useFollowPersonHandlersProps.ts'
export function useFollowPersonHandlers({
  onFollow,
  followId,
  person,
  setPanel,
}: FollowPersonHandlersProps) {
  const handleClick = useCallback<() => void>(() => {
    onFollow(followId === person.clientId ? null : person.clientId)
    setPanel(null)
  }, [onFollow, followId, person, setPanel])
  return { handleClick }
}
