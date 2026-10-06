import { query } from '@/shared/config/query.ts'
import { subscribe } from '@/shared/utils/useCompactLayoutSubscribe.ts'
import { useSyncExternalStore } from 'react'
export function useCompactLayout() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
