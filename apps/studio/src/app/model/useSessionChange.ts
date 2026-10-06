import { useEffect, useSyncExternalStore } from 'react'
import { sessionTokenKey } from '@/shared/config/sessionTokenKey.ts'
import { sessionChangeKey } from '@/shared/config/sessionChangeKey.ts'
import { sessionChangeStore, sessionChanged } from './sessionChangeStore.ts'

export function useSessionChange() {
  useEffect(() => {
    const change = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        (event.key === sessionTokenKey ||
          event.key === sessionChangeKey ||
          event.key === null)
      ) {
        sessionChangeStore.dispatch(sessionChanged())
      }
    }
    window.addEventListener('storage', change)
    return () => window.removeEventListener('storage', change)
  }, [])
  return useSyncExternalStore(
    sessionChangeStore.subscribe,
    sessionChangeStore.getState,
  )
}
