import { request } from '@/shared/api/request.ts'
import { avatarFrom } from '@/widgets/collaboration/utils/avatarFrom.ts'
import type { Profile } from '@pomegranate/domain/collaboration'
import { useCallback } from 'react'

import type { ProfileFormHandlersProps } from '../types/useProfileFormHandlersProps.ts'
export function useProfileFormHandlers({
  setBusy,
  setError,
  name,
  avatar,
  onProfile,
  setPanel,
  opener,
  setAvatar,
}: ProfileFormHandlersProps) {
  const handleSubmit = useCallback<
    (event: import('react').SubmitEvent<HTMLFormElement>) => Promise<void>
  >(
    async (event) => {
      event.preventDefault()
      setBusy(true)
      setError('')
      try {
        const result = await request<{ profile: Profile }>('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, avatar }),
        })
        onProfile(result.profile)
        setPanel(null)
        opener.current?.focus()
      } catch (err) {
        setError(String(err))
      } finally {
        setBusy(false)
      }
    },
    [setBusy, setError, name, avatar, onProfile, setPanel, opener],
  )
  const handleUploadProfilePictureChange = useCallback<
    (
      event: import('react').ChangeEvent<HTMLInputElement, HTMLInputElement>,
    ) => Promise<void>
  >(
    async (event) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return
      setBusy(true)
      try {
        setAvatar(await avatarFrom(file))
        setError('')
      } catch (err) {
        setError(String(err))
      } finally {
        setBusy(false)
      }
    },
    [setBusy, setAvatar, setError],
  )
  return { handleSubmit, handleUploadProfilePictureChange }
}
