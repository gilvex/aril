import { request } from '@/shared/api/request.ts'
import { sessionTokenKey } from '@/shared/config/sessionTokenKey.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { Profile } from '@pomegranate/domain/collaboration'
import { useCallback } from 'react'

import type { JoinStudioFormHandlersProps } from '../types/useJoinStudioFormHandlersProps.ts'
export function useJoinStudioFormHandlers({
  setBusy,
  setError,
  token,
  profile,
  name,
  setProfile,
  setInviteRequired,
  setToken,
}: JoinStudioFormHandlersProps) {
  const { t } = useTranslation()

  const handleSubmit = useCallback<
    (event: import('react').SubmitEvent<HTMLFormElement>) => Promise<void>
  >(
    async (event) => {
      event.preventDefault()
      setBusy(true)
      setError('')
      try {
        const result = await request<{
          profile: Profile
          token: string
        }>('/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: token.trim(),
            name: profile?.name || name,
          }),
        })
        if (result.token) localStorage.setItem(sessionTokenKey, result.token)
        history.replaceState(null, '', location.pathname + location.search)
        setProfile(result.profile)
        setInviteRequired(false)
        setToken('')
      } catch (err) {
        setError(err instanceof Error ? err.message : t('Could not join.'))
      } finally {
        setBusy(false)
      }
    },
    [
      setBusy,
      setError,
      token,
      profile?.name,
      name,
      setProfile,
      setInviteRequired,
      setToken,
      t,
    ],
  )
  return { handleSubmit }
}
