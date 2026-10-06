import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ChangeEvent,
  type SubmitEvent,
} from 'react'
import { request, workspaceHeaders } from '@/shared/api/index.ts'
import { useTranslation } from '@/shared/i18n/index.ts'
import type { SelectChange } from '@/shared/types/index.ts'
import type { GuestLink } from '../types/guestLink.ts'
import { createGuestLinksModel } from './createGuestLinksModel.ts'
import { guestLinksSlice } from './slices/guestLinksSlice.ts'

export function useGuestLinks(workspaceId: string) {
  const { t } = useTranslation()
  const ref = useRef<ReturnType<typeof createGuestLinksModel> | null>(null)
  if (!ref.current) ref.current = createGuestLinksModel()
  const store = ref.current
  const secret = useRef('')
  const state = useSyncExternalStore(store.subscribe, store.getState)
  const patch = useCallback(
    (value: Parameters<typeof guestLinksSlice.actions.patch>[0]) => {
      store.dispatch(guestLinksSlice.actions.patch(value))
    },
    [store],
  )
  const load = useCallback(async () => {
    const links = await request<GuestLink[]>('/api/guest-links', {
      headers: workspaceHeaders(workspaceId),
    })
    patch({ links, loading: false })
  }, [workspaceId, patch])
  useEffect(() => {
    void load().catch((error) =>
      patch({ error: t(error.message), loading: false }),
    )
  }, [load, patch, t])
  const create = useCallback(
    async (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault()
      patch({ busy: true, error: '' })
      try {
        const result = await request<{ token: string }>('/api/guest-links', {
          method: 'POST',
          headers: {
            ...workspaceHeaders(workspaceId),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: state.name,
            minutes: state.duration * state.unit,
          }),
        })
        secret.current = `${location.origin}/#guest=${result.token}`
        patch({ copied: false })
        await load()
      } catch (error) {
        patch({
          error: t(
            error instanceof Error
              ? error.message
              : 'Could not create guest link.',
          ),
        })
      } finally {
        patch({ busy: false })
      }
    },
    [load, patch, state.duration, state.name, state.unit, workspaceId, t],
  )
  const revoke = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const id = event.currentTarget.dataset.linkId
      patch({ busy: true, error: '' })
      try {
        await request(`/api/guest-links/${id}`, {
          method: 'DELETE',
          headers: workspaceHeaders(workspaceId),
        })
        secret.current = ''
        await load()
      } catch (error) {
        patch({
          error: t(
            error instanceof Error
              ? error.message
              : 'Could not revoke guest link.',
          ),
        })
      } finally {
        patch({ busy: false })
      }
    },
    [load, patch, workspaceId, t],
  )
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(secret.current)
      patch({ copied: true })
    } catch {
      patch({ error: t('Select and copy the invite link above.') })
    }
  }, [patch, t])
  const changeName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      patch({ name: event.target.value }),
    [patch],
  )
  const changeDuration = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      patch({ duration: Number(event.target.value) }),
    [patch],
  )
  const changeUnit = useCallback(
    (event: SelectChange) => patch({ unit: Number(event.target.value) }),
    [patch],
  )
  return {
    ...state,
    url: secret.current,
    create,
    revoke,
    copy,
    changeName,
    changeDuration,
    changeUnit,
  }
}
