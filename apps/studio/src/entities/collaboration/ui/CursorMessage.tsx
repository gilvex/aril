import { useCallback, useSyncExternalStore } from 'react'
import type { Presence } from '@pomegranate/domain/collaboration'
import './cursorMessage.css'
export function CursorMessage({ chat }: Pick<Presence, 'chat'>) {
  const expires = chat?.expiresAt || 0
  const subscribe = useCallback(
    (notify: () => void) => {
      const timer = setTimeout(
        notify,
        Math.max(0, Math.min(expires - Date.now(), 15000)) + 10,
      )
      return () => clearTimeout(timer)
    },
    [expires],
  )
  const read = useCallback(
    () =>
      expires > Date.now() && expires <= Date.now() + 15000
        ? chat?.text || ''
        : '',
    [chat, expires],
  )
  const text = useSyncExternalStore(subscribe, read)
  return text ? (
    <em className="cursor-message" role="status">
      {': ' + text}
    </em>
  ) : null
}
