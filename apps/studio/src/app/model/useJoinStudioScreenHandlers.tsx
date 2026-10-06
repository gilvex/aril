import { useCallback } from 'react'

export function useJoinStudioScreenHandlers() {
  const handleSuccess = useCallback(() => location.reload(), [])
  return { handleSuccess }
}
