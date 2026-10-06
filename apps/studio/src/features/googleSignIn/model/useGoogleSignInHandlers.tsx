import { useCallback } from 'react'

import type { GoogleSignInHandlersProps } from '../types/useGoogleSignInHandlersProps.ts'
export function useGoogleSignInHandlers({
  setError,
  setRetry,
}: GoogleSignInHandlersProps) {
  const handleClick = useCallback<() => void>(() => {
    setError('')
    setRetry((value) => value + 1)
  }, [setError, setRetry])
  return { handleClick }
}
