import { useCallback } from 'react'
import type { JoinStudioScreenProps } from '../types/joinStudioScreenProps.ts'

export function useJoinStudioScreenHandlers({
  setToken,
  setInviteRequired,
  setError,
}: Pick<JoinStudioScreenProps, 'setToken' | 'setInviteRequired' | 'setError'>) {
  const handleSuccess = useCallback(() => location.reload(), [])
  const openWorkspaces = useCallback(() => {
    const url = new URL(location.href)
    const hash = new URLSearchParams(url.hash.slice(1))
    hash.delete('invite')
    url.hash = hash.toString()
    history.replaceState(
      history.state,
      '',
      url.pathname + url.search + url.hash,
    )
    setToken('')
    setInviteRequired(false)
    setError('')
  }, [setToken, setInviteRequired, setError])
  return { handleSuccess, openWorkspaces }
}
